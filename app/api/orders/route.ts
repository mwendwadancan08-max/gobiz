
import { randomUUID } from "crypto";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderItemInput = {
  productId: string;
  quantity: number;
};

type OrderRequest = {
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  items: OrderItemInput[];
  fulfillmentMethod: "DELIVERY" | "PICKUP";
  deliveryAddress?: string;
  buildingName?: string;
  floor?: string;
  doorNumber?: string;
  latitude?: number;
  longitude?: number;
};

type DbOrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) *
      Math.cos(radians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function validCoordinate(value: unknown, min: number, max: number) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

/* GET: Fetch orders, customer details, items, and GPS coordinates. */
export async function GET() {
  try {
    const rows = await sql`
      SELECT
        o.id::text AS id,
        o.order_number AS "orderNumber",
        o.status::text AS status,
        o.total_kes AS amount,
        o.created_at AS "createdAt",
        o.fulfillment_method::text AS "fulfillmentMethod",
        o.delivery_address AS "deliveryAddress",
        o.building_name AS "buildingName",
        o.floor AS floor,
        o.delivery_notes AS "deliveryNotes",
        o.latitude AS latitude,
        o.longitude AS longitude,
        c.name AS customer,
        c.phone AS phone,
        c.email AS email,
        COALESCE(
          json_agg(
            json_build_object(
              'name', oi.product_name,
              'quantity', oi.quantity,
              'unitPrice', oi.unit_price_kes,
              'lineTotal', oi.line_total_kes
            )
            ORDER BY oi.product_name
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM public.customer_orders o
      JOIN public.customers c ON c.id = o.customer_id
      LEFT JOIN public.order_items oi ON oi.order_id = o.id
      GROUP BY
        o.id,
        o.order_number,
        o.status,
        o.total_kes,
        o.created_at,
        o.fulfillment_method,
        o.delivery_address,
        o.building_name,
        o.floor,
        o.delivery_notes,
        o.latitude,
        o.longitude,
        c.name,
        c.phone,
        c.email
      ORDER BY o.created_at DESC
      LIMIT 500
    `;

    const orders = rows.map((row) => ({
      ...row,
      id: String(row.id),
      orderNumber: String(row.orderNumber),
      customer: String(row.customer),
      phone: String(row.phone),
      email: String(row.email),
      amount: Number(row.amount),
      latitude: row.latitude == null ? null : Number(row.latitude),
      longitude: row.longitude == null ? null : Number(row.longitude),
      fulfillmentMethod: String(row.fulfillmentMethod),
      status: String(row.status).toUpperCase(),
      items: Array.isArray(row.items) ? row.items : [],
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GoBiz orders fetch failed:", error);

    return NextResponse.json(
      { error: "Could not load orders." },
      { status: 500 }
    );
  }
}

/* PATCH: Update order status using the database's allowed statuses. */
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      status?: string;
    };

    const id = typeof body.id === "string" ? body.id.trim() : "";
    const status = body.status?.toUpperCase();

    const allowedStatuses: DbOrderStatus[] = [
      "PENDING",
      "ACCEPTED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    if (!status || !allowedStatuses.includes(status as DbOrderStatus)) {
      return NextResponse.json(
        { error: "Invalid order status." },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE public.customer_orders
      SET status = ${status}
      WHERE id::text = ${id}
      RETURNING
        id::text AS id,
        order_number AS "orderNumber",
        status::text AS status
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...updated[0],
        status: String(updated[0].status).toUpperCase(),
      },
    });
  } catch (error) {
    console.error("GoBiz order status update failed:", error);

    return NextResponse.json(
      { error: "Could not update order status. Check the server terminal." },
      { status: 500 }
    );
  }
}

/* POST: Validate and create an order, its items, payment, and event. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderRequest;

    const name =
      typeof body.customer?.name === "string"
        ? body.customer.name.trim()
        : "";

    const phone =
      typeof body.customer?.phone === "string"
        ? body.customer.phone.trim()
        : "";

    const email =
      typeof body.customer?.email === "string"
        ? body.customer.email.trim().toLowerCase()
        : "";

    if (!name || name.length > 150) {
      return NextResponse.json(
        { error: "Enter your full name." },
        { status: 400 }
      );
    }

    const digitCount = phone.replace(/\D/g, "").length;

    if (
      !phone ||
      phone.length > 30 ||
      digitCount < 7 ||
      !/^[+()\d\s-]+$/.test(phone)
    ) {
      return NextResponse.json(
        { error: "Enter a valid phone number." },
        { status: 400 }
      );
    }

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const items = body.items;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return NextResponse.json(
        { error: "Your cart is empty or contains too many products." },
        { status: 400 }
      );
    }

    const productIds = new Set<string>();

    for (const item of items) {
      if (
        typeof item.productId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          item.productId
        ) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return NextResponse.json(
          { error: "One or more cart items are invalid." },
          { status: 400 }
        );
      }

      if (productIds.has(item.productId)) {
        return NextResponse.json(
          { error: "Duplicate cart items are not allowed." },
          { status: 400 }
        );
      }

      productIds.add(item.productId);
    }

    const fulfillmentMethod = body.fulfillmentMethod;

    if (
      fulfillmentMethod !== "DELIVERY" &&
      fulfillmentMethod !== "PICKUP"
    ) {
      return NextResponse.json(
        { error: "Choose delivery or pickup." },
        { status: 400 }
      );
    }

    const deliveryAddress =
      typeof body.deliveryAddress === "string"
        ? body.deliveryAddress.trim()
        : "";

    const buildingName =
      typeof body.buildingName === "string"
        ? body.buildingName.trim() || null
        : null;

    const floor =
      typeof body.floor === "string"
        ? body.floor.trim() || null
        : null;

    const doorNumber =
      typeof body.doorNumber === "string"
        ? body.doorNumber.trim() || null
        : null;

    if (
      [buildingName, floor, doorNumber].some(
        (value) => value !== null && value.length > 100
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Plot, floor, and door details must be under 100 characters.",
        },
        { status: 400 }
      );
    }

    if (
      fulfillmentMethod === "DELIVERY" &&
      (!deliveryAddress ||
        deliveryAddress.length > 500 ||
        !validCoordinate(body.latitude, -90, 90) ||
        !validCoordinate(body.longitude, -180, 180))
    ) {
      return NextResponse.json(
        {
          error:
            "Enter your area name and share your GPS location to arrange delivery.",
        },
        { status: 400 }
      );
    }

    const deliveryNotes = doorNumber
      ? `Door number: ${doorNumber}`
      : null;

    const latitude =
      fulfillmentMethod === "DELIVERY" ? body.latitude! : null;

    const longitude =
      fulfillmentMethod === "DELIVERY" ? body.longitude! : null;

    const productRows = await sql`
      SELECT
        p.id::text AS id,
        p.name,
        p.price_kes
      FROM public.products p
      JOIN public.categories c ON c.id = p.category_id
      WHERE p.id IN (
        SELECT x."productId"
        FROM jsonb_to_recordset(
          ${JSON.stringify(items)}::jsonb
        ) AS x("productId" uuid, quantity integer)
      )
      AND p.available = true
      AND c.active = true
    `;

    if (productRows.length !== items.length) {
      return NextResponse.json(
        {
          error:
            "Some products are unavailable. Refresh the marketplace and try again.",
        },
        { status: 409 }
      );
    }

    const productMap = new Map(
      productRows.map((product) => [
        String(product.id),
        {
          name: String(product.name),
          price: Number(product.price_kes),
        },
      ])
    );

    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (
        !product ||
        !Number.isSafeInteger(product.price) ||
        product.price < 0
      ) {
        return NextResponse.json(
          { error: "A product in your cart is unavailable." },
          { status: 409 }
        );
      }

      subtotal += product.price * item.quantity;

      if (!Number.isSafeInteger(subtotal)) {
        return NextResponse.json(
          { error: "The order total is too large." },
          { status: 400 }
        );
      }
    }

    let deliveryFee = 0;

    if (fulfillmentMethod === "DELIVERY") {
      const settings = await sql`
        SELECT
          service_latitude,
          service_longitude,
          radius_km,
          fee_mode,
          fixed_fee_kes,
          fee_percentage
        FROM public.delivery_settings
        WHERE id = 1
        LIMIT 1
      `;

      const setting = settings[0];

      if (
        !setting ||
        setting.service_latitude == null ||
        setting.service_longitude == null
      ) {
        return NextResponse.json(
          { error: "Delivery is not configured. Please contact GoBiz." },
          { status: 503 }
        );
      }

      const distance = distanceKm(
        Number(setting.service_latitude),
        Number(setting.service_longitude),
        body.latitude!,
        body.longitude!
      );

      if (distance > Number(setting.radius_km)) {
        return NextResponse.json(
          {
            error:
              "Your GPS location is outside the GoBiz delivery area.",
          },
          { status: 422 }
        );
      }

      switch (setting.fee_mode) {
        case "FREE":
          deliveryFee = 0;
          break;

        case "FIXED":
          deliveryFee = Number(setting.fixed_fee_kes);
          break;

        case "PERCENTAGE":
          deliveryFee = Math.round(
            subtotal * (Number(setting.fee_percentage) / 100)
          );
          break;

        default:
          return NextResponse.json(
            { error: "GoBiz delivery settings are invalid." },
            { status: 503 }
          );
      }

      if (!Number.isSafeInteger(deliveryFee) || deliveryFee < 0) {
        return NextResponse.json(
          { error: "GoBiz delivery fees are invalid." },
          { status: 503 }
        );
      }
    }

    const total = subtotal + deliveryFee;

    if (!Number.isSafeInteger(total)) {
      return NextResponse.json(
        { error: "The order total is too large." },
        { status: 400 }
      );
    }

    const orderNumber =
      `GB-${Date.now().toString(36).toUpperCase()}-${randomUUID()
        .slice(0, 6)
        .toUpperCase()}`;

    const result = await sql`
      WITH customer_insert AS (
        INSERT INTO public.customers (name, phone, email)
        SELECT ${name}, ${phone}, ${email}
        WHERE NOT EXISTS (
          SELECT 1
          FROM public.customers
          WHERE phone = ${phone}
        )
        RETURNING id
      ),
      customer_row AS (
        SELECT id FROM customer_insert
        UNION ALL
        SELECT id
        FROM public.customers
        WHERE phone = ${phone}
        LIMIT 1
      ),
      valid_products AS (
        SELECT
          p.id,
          p.name,
          p.price_kes,
          cart.quantity
        FROM jsonb_to_recordset(
          ${JSON.stringify(items)}::jsonb
        ) AS cart("productId" uuid, quantity integer)
        JOIN public.products p
          ON p.id = cart."productId"
         AND p.available = true
        JOIN public.categories c
          ON c.id = p.category_id
         AND c.active = true
      ),
      order_insert AS (
        INSERT INTO public.customer_orders (
          order_number,
          customer_id,
          status,
          fulfillment_method,
          subtotal_kes,
          delivery_fee_kes,
          total_kes,
          delivery_address,
          building_name,
          floor,
          delivery_notes,
          latitude,
          longitude
        )
        SELECT
          ${orderNumber},
          customer_row.id,
          'PENDING',
          ${fulfillmentMethod},
          ${subtotal},
          ${deliveryFee},
          ${total},
          ${fulfillmentMethod === "DELIVERY" ? deliveryAddress : null}::text,
          ${fulfillmentMethod === "DELIVERY" ? buildingName : null}::text,
          ${fulfillmentMethod === "DELIVERY" ? floor : null}::text,
          ${fulfillmentMethod === "DELIVERY" ? deliveryNotes : null}::text,
          ${latitude}::double precision,
          ${longitude}::double precision
        FROM customer_row
        WHERE (SELECT COUNT(*) FROM valid_products) = ${items.length}
        RETURNING id, order_number, total_kes, created_at
      ),
      item_insert AS (
        INSERT INTO public.order_items (
          order_id,
          product_id,
          product_name,
          quantity,
          unit_price_kes,
          line_total_kes
        )
        SELECT
          order_insert.id,
          valid_products.id,
          valid_products.name,
          valid_products.quantity,
          valid_products.price_kes,
          valid_products.price_kes * valid_products.quantity
        FROM order_insert
        CROSS JOIN valid_products
        RETURNING id
      ),
      payment_insert AS (
        INSERT INTO public.payments (
          order_id,
          method,
          status,
          amount_kes
        )
        SELECT
          id,
          'CASH_ON_DELIVERY',
          'PENDING',
          total_kes
        FROM order_insert
        RETURNING id
      ),
      event_insert AS (
        INSERT INTO public.order_events (
          order_id,
          event_type,
          details
        )
        SELECT
          id,
          'ORDER_PLACED',
          jsonb_build_object(
            'source', 'website',
            'fulfillment_method', ${fulfillmentMethod}::text
          )
        FROM order_insert
        RETURNING id
      )
      SELECT
        order_insert.id::text AS id,
        order_insert.order_number,
        order_insert.total_kes,
        order_insert.created_at,
        (SELECT COUNT(*) FROM item_insert) AS item_count,
        (SELECT COUNT(*) FROM payment_insert) AS payment_count,
        (SELECT COUNT(*) FROM event_insert) AS event_count
      FROM order_insert
    `;

    const created = result[0];

    if (
      !created ||
      Number(created.item_count) !== items.length ||
      Number(created.payment_count) !== 1 ||
      Number(created.event_count) !== 1
    ) {
      console.error("Order creation returned an incomplete result.");

      return NextResponse.json(
        {
          error:
            "The order could not be completed. Please refresh your cart and try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: created.id,
          orderNumber: created.order_number,
          subtotal,
          deliveryFee,
          total: Number(created.total_kes),
          fulfillmentMethod,
          status: "PENDING",
          paymentMethod: "CASH_ON_DELIVERY",
          createdAt: created.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("GoBiz order creation failed:", error);

    return NextResponse.json(
      { error: "We could not place your order. Please try again." },
      { status: 500 }
    );
  }
}
