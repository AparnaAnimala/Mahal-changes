# from flask import Blueprint, request, jsonify
# from db import get_db_connection
# from datetime import datetime
# import uuid
# from flask_cors import CORS
# from psycopg2.extras import RealDictCursor


# payment_bp = Blueprint("payment_bp", __name__)

# # =====================================================
# # PAYMENT API – SAVE PAYMENT
# # =====================================================
# @payment_bp.route("/payment", methods=["POST", "OPTIONS"])
# def create_payment():

#     if request.method == "OPTIONS":
#         return jsonify({"status": "ok"}), 200

#     data = request.json
#     print("PAYMENT DATA:", data)

#     required_fields = ["order_id", "payment_method", "amount"]
#     for f in required_fields:
#         if not data.get(f):
#             return jsonify({"error": f"{f} is required"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         transaction_id = f"TXN{uuid.uuid4().hex[:10]}"

#         cur.execute("""
#             INSERT INTO order_payments (
#                 order_id, payment_method, transaction_id,
#                 amount, payment_status, payment_date
#             )
#             VALUES (%s,%s,%s,%s,%s,%s)
#             RETURNING payment_id
#         """, (
#             data["order_id"],
#             data["payment_method"],
#             transaction_id,
#             data["amount"],
#             "SUCCESS",
#             datetime.now()
#         ))

#         payment_id = cur.fetchone()["payment_id"]

#         cur.execute("""
#             UPDATE order_header
#             SET payment_status='PAID'
#             WHERE order_id=%s
#         """, (data["order_id"],))

#         conn.commit()

#         return jsonify({
#             "success": True,
#             "payment_id": payment_id,
#             "transaction_id": transaction_id
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         print("PAYMENT ERROR:", e)
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()


# # =====================================================
# # GET PAYMENTS BY ORDER ID
# # =====================================================
# @payment_bp.route("/payment/<order_id>", methods=["GET"])
# def get_payment_by_order(order_id):

#     conn = get_db_connection()
#     cur = conn.cursor()

#     try:
#         cur.execute("""
#             SELECT *
#             FROM order_payments
#             WHERE order_id = %s
#             ORDER BY payment_date DESC
#         """, (order_id,))

#         payments = cur.fetchall()

#         return jsonify({
#             "success": True,
#             "data": payments
#         }), 200

#     except Exception as e:
#         return jsonify({
#             "error": "Failed to fetch payments",
#             "details": str(e)
#         }), 500

#     finally:
#         cur.close()
#         conn.close()



# from flask import Blueprint, request, jsonify
# from flask_cors import CORS
# from psycopg2.extras import RealDictCursor
# from db import get_db_connection
# from datetime import datetime
# import uuid

# payment_bp = Blueprint("payment_bp", __name__)
# CORS(payment_bp)   # 🔥 REQUIRED for React OPTIONS call


# # =====================================================
# # PAYMENT API – SAVE PAYMENT
# # URL: POST /api/payment
# # =====================================================
# @payment_bp.route("/payment", methods=["POST", "OPTIONS"])
# def create_payment():

#     # ✅ Preflight request (browser OPTIONS)
#     if request.method == "OPTIONS":
#         return "", 200

#     data = request.get_json()
#     print("PAYMENT DATA:", data)

#     # -----------------------------
#     # 1️⃣ Validate input
#     # -----------------------------
#     required_fields = ["order_id", "payment_method", "amount"]
#     for f in required_fields:
#         if not data or data.get(f) in [None, ""]:
#             return jsonify({"error": f"{f} is required"}), 400

#     order_id = data["order_id"]
#     method = data["payment_method"]
#     amount = data["amount"]

#     # -----------------------------
#     # 2️⃣ Decide payment status
#     # -----------------------------
#     if method == "cod":
#         payment_status = "PENDING"
#     else:
#         payment_status = "SUCCESS"

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # -----------------------------
#         # 3️⃣ Create transaction ID
#         # -----------------------------
#         transaction_id = f"TXN{uuid.uuid4().hex[:10]}"

#         # -----------------------------
#         # 4️⃣ Insert payment
#         # -----------------------------
#         cur.execute("""
#             INSERT INTO order_payments (
#                 order_id,
#                 payment_method,
#                 transaction_id,
#                 amount,
#                 payment_status,
#                 payment_date
#             )
#             VALUES (%s,%s,%s,%s,%s,%s)
#             RETURNING payment_id
#         """, (
#             order_id,
#             method,
#             transaction_id,
#             amount,
#             payment_status,
#             datetime.now()
#         ))

#         payment_id = cur.fetchone()["payment_id"]

#         # -----------------------------
#         # 5️⃣ Update order_header
#         # -----------------------------
#         cur.execute("""
#             UPDATE order_header
#             SET payment_status = %s
#             WHERE order_id = %s
#         """, (
#             "PAID" if payment_status == "SUCCESS" else "PENDING",
#             order_id
#         ))

#         conn.commit()

#         return jsonify({
#             "success": True,
#             "payment_id": payment_id,
#             "transaction_id": transaction_id,
#             "payment_status": payment_status
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         print("PAYMENT ERROR:", e)
#         return jsonify({
#             "success": False,
#             "error": "Payment failed",
#             "details": str(e)
#         }), 500

#     finally:
#         cur.close()
#         conn.close()


from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from db import get_db_connection
from datetime import datetime, timedelta
import uuid, jwt

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

payment_bp = Blueprint("payment_bp", __name__)

# =========================================
# JWT → RESTAURANT CONTEXT
# =========================================
def get_restaurant_from_token():
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


# @payment_bp.route("/", methods=["POST"])
# def create_payment():

#     restaurant_id = get_restaurant_from_token()
#     if not restaurant_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     data = request.get_json() or {}

#     for field in ["order_id", "payment_method", "amount"]:
#         if field not in data:
#             return jsonify({"error": f"{field} required"}), 400

#     coupon_id = data.get("coupon_id")  # ✅ NEW

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # 🔐 VERIFY ORDER OWNERSHIP
#         cur.execute("""
#             SELECT order_id
#             FROM order_header
#             WHERE order_id = %s AND restaurant_id = %s
#         """, (data["order_id"], restaurant_id))

#         if not cur.fetchone():
#             return jsonify({"error": "Order not found"}), 403

#         transaction_id = f"TXN{uuid.uuid4().hex[:10]}"
#         status = "PENDING" if data["payment_method"] == "cod" else "SUCCESS"

#         # ================= PAYMENT INSERT =================
#         cur.execute("""
#             INSERT INTO order_payments (
#                 order_id, payment_method, transaction_id,
#                 amount, payment_status, payment_date
#             )
#             VALUES (%s,%s,%s,%s,%s,%s)
#         """, (
#             data["order_id"],
#             data["payment_method"],
#             transaction_id,
#             data["amount"],
#             status,
#             datetime.now()
#         ))

#         # ================= UPDATE ORDER =================
#         cur.execute("""
#             UPDATE order_header
#             SET payment_status = %s
#             WHERE order_id = %s
#         """, (
#             "PAID" if status == "SUCCESS" else "PENDING",
#             data["order_id"]
#         ))

#         # ================= UPDATE COUPON USAGE =================
#         if coupon_id and status == "SUCCESS":
#             cur.execute("""
#                 UPDATE coupons
#                 SET
#                     usage_limit_total =
#                         CASE
#                             WHEN usage_limit_total > 0
#                             THEN usage_limit_total - 1
#                             ELSE 0
#                         END,
#                     usage_limit_per_restaurant =
#                         CASE
#                             WHEN usage_limit_per_restaurant > 0
#                             THEN usage_limit_per_restaurant - 1
#                             ELSE 0
#                         END
#                 WHERE coupon_id = %s
#             """, (coupon_id,))

#         conn.commit()

#         return jsonify({
#             "success": True,
#             "transaction_id": transaction_id,
#             "payment_status": status
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()

@payment_bp.route("/", methods=["POST"])
def create_payment():

    restaurant_id = get_restaurant_from_token()
    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}

    # ✅ REQUIRED FIELDS
    for field in ["order_id", "payment_method", "amount"]:
        if field not in data:
            return jsonify({"error": f"{field} required"}), 400

    coupon_id = data.get("coupon_id")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # =====================================
        # 🔐 VERIFY ORDER
        # =====================================
        cur.execute("""
            SELECT *
            FROM order_header
            WHERE order_id = %s AND restaurant_id = %s
        """, (data["order_id"], restaurant_id))

        order = cur.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 403

        transaction_id = f"TXN{uuid.uuid4().hex[:10]}"
        method = data["payment_method"].lower()
        amount = float(data["amount"])

        # =====================================
        # 🔥 NORMALIZE METHOD
        # =====================================
        if method in ["card", "upi", "netbanking"]:
            method = "online"

        # =====================================
        # 💳 CREDIT PAYMENT
        # =====================================
        if method == "credit":

            # 🔒 LOCK CREDIT
            cur.execute("""
                SELECT credit_limit, credit_used, credit_days, is_credit_blocked
                FROM restaurant_registration
                WHERE restaurant_id = %s
                FOR UPDATE
            """, (restaurant_id,))

            credit = cur.fetchone()

            if not credit:
                return jsonify({"error": "Credit info not found"}), 400

            if credit["is_credit_blocked"]:
                return jsonify({"error": "Credit account is blocked"}), 400

            # 🔴 OVERDUE CHECK
            cur.execute("""
                SELECT COUNT(*) AS overdue_count
                FROM order_header
                WHERE restaurant_id = %s
                  AND payment_method = 'CREDIT'
                  AND restaurant_due_amount > 0
                  AND credit_due_date < CURRENT_DATE
            """, (restaurant_id,))

            overdue = cur.fetchone()["overdue_count"]

            if overdue > 0:
                return jsonify({
                    "error": "You have overdue payments. Please clear dues."
                }), 400

            # ================= CALCULATIONS =================
            limit_val = float(credit["credit_limit"] or 0)
            used_val = float(credit["credit_used"] or 0)
            credit_days = int(credit["credit_days"] or 0)

            available_credit = limit_val - used_val

            if amount > available_credit:
                return jsonify({
                    "error": f"Credit limit exceeded. Available: {available_credit}"
                }), 400

            # ================= UPDATE CREDIT =================
            cur.execute("""
                UPDATE restaurant_registration
                SET credit_used = credit_used + %s
                WHERE restaurant_id = %s
            """, (amount, restaurant_id))

            # ================= DUE DATE =================
            credit_due_date = datetime.now().date() + timedelta(days=credit_days)

            # ================= UPDATE ORDER =================
            cur.execute("""
                UPDATE order_header
                SET 
                    payment_method = 'CREDIT',
                    payment_status = 'UNPAID',
                    credit_status = 'PENDING',
                    credit_due_date = %s,

                    restaurant_paid_amount = 0,
                    restaurant_due_amount = %s,
                    restaurant_payment_status = 'UNPAID',

                    supplier_paid_amount = 0,
                    supplier_due_amount = %s,
                    supplier_payment_status = 'UNPAID'

                WHERE order_id = %s
            """, (
                credit_due_date,
                amount,
                amount,
                data["order_id"]
            ))

            status = "SUCCESS"

        # =====================================
        # 💵 COD PAYMENT
        # =====================================
        elif method == "cod":

            cur.execute("""
                UPDATE order_header
                SET 
                    payment_method = 'COD',
                    payment_status = 'PENDING',

                    restaurant_paid_amount = 0,
                    restaurant_due_amount = %s,
                    restaurant_payment_status = 'PENDING',

                    supplier_paid_amount = 0,
                    supplier_due_amount = %s,
                    supplier_payment_status = 'UNPAID'

                WHERE order_id = %s
            """, (amount, amount, data["order_id"]))

            status = "PENDING"

        # =====================================
        # 🌐 ONLINE PAYMENT
        # =====================================
        elif method == "online":

            cur.execute("""
                UPDATE order_header
                SET 
                    payment_method = 'ONLINE',
                    payment_status = 'PAID',

                    restaurant_paid_amount = %s,
                    restaurant_due_amount = 0,
                    restaurant_payment_status = 'PAID',

                    supplier_paid_amount = 0,
                    supplier_due_amount = %s,
                    supplier_payment_status = 'UNPAID'

                WHERE order_id = %s
            """, (amount, amount, data["order_id"]))

            status = "SUCCESS"

        # =====================================
        # ❌ INVALID METHOD
        # =====================================
        else:
            return jsonify({"error": "Invalid payment method"}), 400

        # =====================================
        # 🧾 INSERT PAYMENT RECORD
        # =====================================
        cur.execute("""
            INSERT INTO order_payments (
                order_id, payment_method, transaction_id,
                amount, payment_status, payment_date
            )
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (
            data["order_id"],
            method,
            transaction_id,
            amount,
            status,
            datetime.now()
        ))

        # =====================================
        # 🎟️ COUPON UPDATE
        # =====================================
        if coupon_id and status == "SUCCESS":
            cur.execute("""
                UPDATE coupons
                SET
                    usage_limit_total =
                        CASE
                            WHEN usage_limit_total > 0
                            THEN usage_limit_total - 1
                            ELSE 0
                        END,
                    usage_limit_per_restaurant =
                        CASE
                            WHEN usage_limit_per_restaurant > 0
                            THEN usage_limit_per_restaurant - 1
                            ELSE 0
                        END
                WHERE coupon_id = %s
            """, (coupon_id,))

        conn.commit()

        return jsonify({
            "success": True,
            "transaction_id": transaction_id,
            "payment_status": status,
            "payment_method": method
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()