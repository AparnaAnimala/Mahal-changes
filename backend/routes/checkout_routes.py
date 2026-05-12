

from flask import Blueprint, request, jsonify
from db import get_db_connection
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import time
import jwt

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

checkout_bp = Blueprint("checkout_bp", __name__)


# =====================================================
# JWT → RESTAURANT CONTEXT
# =====================================================
def get_restaurant_id_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None

    try:
        token = auth.replace("Bearer ", "")
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if decoded.get("role") != "restaurant":
            return None
        return decoded.get("linked_id")
    except Exception:
        return None


# =====================================================
# CHECKOUT
# =====================================================
@checkout_bp.route("/checkout", methods=["POST"])
def checkout():

    data = request.get_json() or {}
    payment_method = data.get("payment_method", "COD")

    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    # for field in ("name", "phone", "address"):
    #     if not data.get(field):
    #         return jsonify({"error": f"{field} is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ================= CREDIT LOCK =================
        # cur.execute("""
        #     SELECT credit_limit, credit_used, credit_days, is_credit_blocked
        #     FROM restaurant_registration
        #     WHERE restaurant_id = %s
        #     FOR UPDATE
        # """, (restaurant_id,))
        # credit_info = cur.fetchone()

        # if payment_method == "CREDIT" and credit_info["is_credit_blocked"]:
        #     return jsonify({"error": "Credit account is blocked"}), 400

        # ================= CART LOCK =================
        cur.execute("""
            SELECT cart_id
            FROM cart_header
            WHERE restaurant_id = %s
              AND status = 'ACTIVE'
            FOR UPDATE
        """, (restaurant_id,))
        cart = cur.fetchone()

        if not cart:
            return jsonify({"error": "No active cart found"}), 400

        cart_id = cart["cart_id"]

        # ================= SUPPLIERS =================
        cur.execute("""
            SELECT DISTINCT supplier_id
            FROM cart_items
            WHERE cart_id = %s
        """, (cart_id,))
        suppliers = cur.fetchall()

        if not suppliers:
            return jsonify({"error": "Cart is empty"}), 400

        created_orders = []

        # =================================================
        # 🔁 LOOP SUPPLIERS
        # =================================================
        for s in suppliers:

            supplier_id = s["supplier_id"]
            order_id = f"ORD{int(time.time() * 1000)}{supplier_id}"

            # subtotal
            cur.execute("""
                SELECT COALESCE(SUM(quantity * price_per_unit), 0) AS subtotal
                FROM cart_items
                WHERE cart_id = %s AND supplier_id = %s
            """, (cart_id, supplier_id))

            subtotal = float(cur.fetchone()["subtotal"] or 0)

            if subtotal <= 0:
                continue

            order_time = datetime.now()

          

            cur.execute("""
                INSERT INTO order_header (
                       order_id,
        restaurant_id,
        supplier_id,
        order_date,
        status,
        payment_status,
        total_amount,
        remarks,
        delivery_instructions,
        payment_method
                )
               VALUES (  %s,
        %s,
        %s,
        %s,
        'PLACED',
        'UNPAID',
        %s,
        %s,
        %s,
        %s)
            """, (
                 order_id,
                restaurant_id,
                supplier_id,
                order_time,
                subtotal,

                # ✅ NOTE
                data.get("note"),

                # ✅ DELIVERY INSTRUCTIONS
                data.get("delivery_instructions"),

                # ✅ PAYMENT METHOD
                payment_method
            ))

            # ================= SUPPLIER NOTIFICATION =================
            cur.execute("""
                INSERT INTO supplier_notifications
                (supplier_id, type, title, message, reference_id)
                VALUES (%s,'NEW_ORDER','New Order Received',%s,%s)
            """, (
                supplier_id,
                f"You have received a new order #{order_id}",
                order_id
            ))

            # ================= ORDER ITEMS =================
            cur.execute("""
                INSERT INTO order_items (
                    order_id, product_id, product_name_english,
                    quantity, price_per_unit, discount, total_amount
                )
                SELECT
                    %s,
                    ci.product_id,
                    pm.product_name_english,
                    ci.quantity,
                    ci.price_per_unit,
                    0,
                    ci.quantity * ci.price_per_unit
                FROM cart_items ci
                JOIN product_management pm
                  ON pm.product_id = ci.product_id
                WHERE ci.cart_id = %s AND ci.supplier_id = %s
            """, (order_id, cart_id, supplier_id))

            # =================================================
            # 📍 ORDER ADDRESS (UPDATED WITH LAT/LNG)
            # =================================================
            cur.execute("""
                INSERT INTO order_address (
                    order_id, address_for, contact_name, phone, email,
                    address_line, street, zone,
                    building, unit_no,
                    city, country, zip_code,
                    lat, lng
                )
                VALUES (
                    %s,'RESTAURANT_DELIVERY',
                    %s,%s,%s,
                    %s,%s,%s,
                    NULL,NULL,
                    %s,%s,%s,
                    %s,%s
                )
            """, (
                order_id,
                data["name"],
                data["phone"],
                data.get("email"),
                data["address"],
                data.get("state"),
                data.get("note"),
                data.get("city"),
                data.get("country"),
                data.get("zip"),
                data.get("lat"),   # ✅ NEW
                data.get("lng")    # ✅ NEW
            ))

            created_orders.append({
                "order_id": order_id,
                "supplier_id": supplier_id,
                "amount": subtotal
            })


       # ================= ARCHIVE =================
        cur.execute("""
            UPDATE cart_header
            SET status = 'ARCHIVED'
            WHERE restaurant_id = %s AND status = 'COMPLETED'
        """, (restaurant_id,))

        conn.commit()

        return jsonify({
            "success": True,
            "orders_created": created_orders
        }), 200

        # # ================= COMPLETE CART =================
        # cur.execute("""
        #     UPDATE cart_header
        #     SET status = 'COMPLETED', updated_at = NOW()
        #     WHERE cart_id = %s
        # """, (cart_id,))

        # # ================= NEW CART =================
        # cur.execute("""
        #     INSERT INTO cart_header (restaurant_id, status)
        #     VALUES (%s, 'ACTIVE')
        # """, (restaurant_id,))

        # conn.commit()

        # return jsonify({
        #     "success": True,
        #     "orders_created": created_orders
        # }), 200

    except Exception as e:
        conn.rollback()
        print("❌ CHECKOUT ERROR:", str(e))
        return jsonify({
            "error": "Checkout failed",
            "details": str(e)
        }), 500

    finally:
        cur.close()
        conn.close()


# =====================================================
# CREDIT INFO
# =====================================================
@checkout_bp.route("/restaurant/credit-info", methods=["GET"])
def credit_info():

    restaurant_id = get_restaurant_id_from_token()

    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT credit_limit, credit_used, credit_days
        FROM restaurant_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))

    rest = cur.fetchone()

    if not rest:
        return jsonify({}), 404

    credit_limit = float(rest["credit_limit"] or 0)
    credit_used = float(rest["credit_used"] or 0)
    credit_days = int(rest["credit_days"] or 0)

    cur.execute("""
        SELECT MIN(credit_due_date) AS next_due_date
        FROM order_header
        WHERE restaurant_id = %s
          AND payment_method = 'CREDIT'
          AND payment_status = 'UNPAID'
    """, (restaurant_id,))

    next_due = cur.fetchone()["next_due_date"]

    cur.execute("""
        SELECT COALESCE(SUM(restaurant_due_amount),0) AS overdue_amount
        FROM order_header
        WHERE restaurant_id = %s
        AND payment_method = 'CREDIT'
        AND restaurant_due_amount > 0
        AND credit_due_date < CURRENT_DATE
    """, (restaurant_id,))

    overdue = float(cur.fetchone()["overdue_amount"] or 0)

    cur.close()
    conn.close()

    return jsonify({
        "credit_limit": credit_limit,
        "credit_used": credit_used,
        "credit_available": credit_limit - credit_used,
        "credit_days": credit_days,
        "next_due_date": next_due,
        "overdue_amount": overdue
    })


# =====================================================
# PROFILE
# =====================================================
@checkout_bp.route("/restaurant/profile", methods=["GET"])
def restaurant_profile():

    restaurant_id = get_restaurant_id_from_token()

    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT contact_person_name, contact_person_mobile
        FROM restaurant_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))

    data = cur.fetchone()

    cur.close()
    conn.close()

    if not data:
        return jsonify({"error": "Not found"}), 404

    return jsonify({
        "name": data["contact_person_name"],
        "phone": data["contact_person_mobile"]
    })

@checkout_bp.route("/address/save", methods=["POST"])
def save_address():
    data = request.json
    restaurant_id = get_restaurant_id_from_token()

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)  # ✅ FIX

    try:
        cur.execute("""
            INSERT INTO user_addresses
            (restaurant_id, name, phone, address, city, state, pincode)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            restaurant_id,
            data["name"],
            data["phone"],
            data["address"],
            data["city"],
            data["state"],
            data["pincode"]
        ))

        row = cur.fetchone()

        new_id = row["id"] if row else None   # ✅ FIX

        conn.commit()

        return jsonify({
            "success": True,
            "id": new_id
        })

    except Exception as e:
        conn.rollback()
        print("❌ ADDRESS SAVE ERROR:", str(e))
        return jsonify({
            "error": "Address save failed",
            "details": str(e)
        }), 500

    finally:
        cur.close()
        conn.close()
   

# ✅ NEW LINE
@checkout_bp.route("/address/update/<int:id>", methods=["PUT"])
def update_address(id):
    data = request.json

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE user_addresses
        SET name=%s, phone=%s, address=%s
        WHERE id=%s
    """, (data["name"], data["phone"], data["address"], id))

    conn.commit()
    return jsonify({"success": True})
@checkout_bp.route("/address/delete/<int:id>", methods=["DELETE"])
def delete_address(id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM user_addresses WHERE id=%s", (id,))
    conn.commit()

    return jsonify({"success": True})



@checkout_bp.route("/location/address", methods=["GET", "POST", "OPTIONS"])
def get_location_address():

    if request.method == "OPTIONS":
        return "", 200

    if request.method == "POST":
        data = request.json
        return jsonify({
            "success": True,
            "received": data
        })

    return jsonify({
        "message": "Location endpoint working"
    }), 200
    
@checkout_bp.route("/location/save", methods=["POST", "OPTIONS"])
def save_location():

    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json()

    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not latitude or not longitude:
        return jsonify({"error": "Missing coordinates"}), 400

    print("📍 Location saved:", latitude, longitude)

    return jsonify({
        "success": True,
        "message": "Location received"
    }), 200
    
@checkout_bp.route("/location/address/default/<int:id>", methods=["GET"])
def get_default_address(id):
    return jsonify({
        "id": id,
        "address": "Default Address Placeholder"
    }), 200
    
@checkout_bp.route("/notifications/count", methods=["GET", "OPTIONS"])
def notifications_count():

    if request.method == "OPTIONS":
        return "", 200

    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"count": 0}), 200

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT COUNT(*) AS count
            FROM supplier_notifications
            WHERE supplier_id = %s
        """, (restaurant_id,))

        result = cur.fetchone()
        return jsonify({"count": result["count"]}), 200

    except Exception as e:
        print("❌ NOTIFICATION ERROR:", str(e))
        return jsonify({"count": 0}), 200

    finally:
        cur.close()
        conn.close()