import sql from '../db/index.js';

const DEFAULT_CATEGORIES = [
  'documents',
  'electronics',
  'clothing',
  'toiletries',
  'medical',
  'accessories',
  'technology',
  'weather',
  'essentials',
  'other',
];

const CATEGORY_LABELS = {
  documents: 'Documents',
  electronics: 'Electronics',
  clothing: 'Clothing',
  toiletries: 'Toiletries',
  medical: 'Medical',
  accessories: 'Accessories',
  technology: 'Technology',
  weather: 'Weather',
  essentials: 'Essentials',
  other: 'Other',
};

function toISODate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function diffInDays(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function lowerName(name) {
  return String(name || '').trim().toLowerCase();
}

function groupItems(items) {
  return items.reduce((acc, item) => {
    const key = item.category || 'other';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}

function buildSummary(items) {
  const packedCount = items.filter((item) => item.is_packed).length;
  const essentialCount = items.filter((item) => item.is_essential).length;
  const overdueCount = items.filter((item) => {
    if (item.is_packed || !item.pack_by) {
      return false;
    }

    const due = new Date(item.pack_by);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return due < today;
  }).length;

  const categories = DEFAULT_CATEGORIES.map((category) => ({
    key: category,
    label: CATEGORY_LABELS[category] || category,
    total: items.filter((item) => item.category === category).length,
    packed: items.filter((item) => item.category === category && item.is_packed).length,
  })).filter((category) => category.total > 0);

  return {
    total_count: items.length,
    packed_count: packedCount,
    remaining_count: Math.max(0, items.length - packedCount),
    completion_rate: items.length ? Math.round((packedCount / items.length) * 100) : 0,
    essential_count: essentialCount,
    overdue_count: overdueCount,
    category_count: categories.length,
    categories,
  };
}

function buildChecklistTemplates(trip, stops, existingNames) {
  const durationDays = diffInDays(trip.start_date, trip.end_date);
  const stopCount = stops.length;
  const destinationNames = stops.map((stop) => stop.city_name).filter(Boolean);
  const isLongTrip = durationDays >= 7;
  const isVeryLongTrip = durationDays >= 10;
  const isMultiStop = stopCount > 1;
  const nameSet = new Set(existingNames.map(lowerName));

  const templates = [
    {
      item_name: 'Passport',
      category: 'documents',
      quantity: 1,
      priority: 'high',
      is_essential: true,
      notes: 'Check expiry, carry a digital copy, and keep it in an accessible pocket.',
    },
    {
      item_name: 'Travel insurance copy',
      category: 'documents',
      quantity: 1,
      priority: 'high',
      is_essential: true,
      notes: 'Store policy number, emergency contacts, and claims details together.',
    },
    {
      item_name: 'Phone charger',
      category: 'electronics',
      quantity: 1,
      priority: 'high',
      is_essential: true,
      notes: 'Pack the charging cable and brick together.',
    },
    {
      item_name: 'Power bank',
      category: 'electronics',
      quantity: 1,
      priority: 'high',
      is_essential: false,
      notes: 'Useful for long transfer days and airport waiting periods.',
    },
    {
      item_name: 'Universal adapter',
      category: 'technology',
      quantity: 1,
      priority: 'high',
      is_essential: false,
      notes: 'Use this if the destination uses a different plug format.',
    },
    {
      item_name: 'Toiletry kit',
      category: 'toiletries',
      quantity: 1,
      priority: 'medium',
      is_essential: true,
      notes: 'Include toothbrush, paste, deodorant, and any daily-use items.',
    },
    {
      item_name: 'Basic medication kit',
      category: 'medical',
      quantity: 1,
      priority: 'high',
      is_essential: true,
      notes: 'Add prescriptions, motion sickness tablets, and pain relief as needed.',
    },
    {
      item_name: 'Day bag',
      category: 'essentials',
      quantity: 1,
      priority: 'medium',
      is_essential: false,
      notes: 'Handy for city walks, excursions, and transfer days.',
    },
    {
      item_name: 'Water bottle',
      category: 'essentials',
      quantity: 1,
      priority: 'medium',
      is_essential: false,
      notes: 'Choose a reusable bottle if the trip is long or active.',
    },
    {
      item_name: 'Socks and underwear',
      category: 'clothing',
      quantity: isLongTrip ? 2 : 1,
      priority: 'medium',
      is_essential: true,
      notes: 'Pack extra if this trip spans multiple cities or long transit days.',
    },
    {
      item_name: 'Weather layer',
      category: 'weather',
      quantity: 1,
      priority: 'medium',
      is_essential: false,
      notes: 'Carry a light jacket, rain shell, or scarf depending on destination weather.',
    },
  ];

  if (isMultiStop) {
    templates.push(
      {
        item_name: 'Transit snacks',
        category: 'essentials',
        quantity: 2,
        priority: 'medium',
        is_essential: false,
        notes: `Useful when moving between ${destinationNames.slice(0, 2).join(' and ') || 'multiple stops'}.`,
      },
      {
        item_name: 'Trip organizer pouch',
        category: 'accessories',
        quantity: 1,
        priority: 'medium',
        is_essential: false,
        notes: 'Keep tickets, boarding passes, receipts, and cables in one place.',
      }
    );
  }

  if (isLongTrip) {
    templates.push({
      item_name: 'Laundry pouch',
      category: 'essentials',
      quantity: 1,
      priority: 'low',
      is_essential: false,
      notes: 'Helpful for separating clean and used clothing on longer itineraries.',
    });
  }

  if (isVeryLongTrip) {
    templates.push({
      item_name: 'Emergency cash',
      category: 'documents',
      quantity: 1,
      priority: 'high',
      is_essential: true,
      notes: 'Keep a small backup cash stash split across luggage and wallet.',
    });
  }

  return templates
    .filter((item) => !nameSet.has(lowerName(item.item_name)))
    .map((item) => ({
      ...item,
      source: 'template',
    }))
    .slice(0, 12);
}

async function getTripForUser(tripId, userId) {
  const rows = await sql`
    SELECT *
    FROM trips
    WHERE id = ${tripId} AND user_id = ${userId}
    LIMIT 1
  `;

  return rows[0] || null;
}

async function getTripStops(tripId) {
  return sql`
    SELECT ts.*, c.city_name, c.country, c.image_url
    FROM trip_stops ts
    LEFT JOIN cities c ON c.id = ts.city_id
    WHERE ts.trip_id = ${tripId}
    ORDER BY ts.stop_order ASC
  `;
}

async function getTripItems(tripId) {
  return sql`
    SELECT *
    FROM packing_items
    WHERE trip_id = ${tripId}
    ORDER BY is_essential DESC, category ASC, created_at DESC
  `;
}

function validateCategory(category) {
  return DEFAULT_CATEGORIES.includes(category) ? category : 'other';
}

function validatePriority(priority) {
  return ['high', 'medium', 'low'].includes(priority) ? priority : 'medium';
}

export async function getChecklist(req, res, next) {
  try {
    const trip = await getTripForUser(req.params.id, req.user.id);

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const [stops, items] = await Promise.all([
      getTripStops(trip.id),
      getTripItems(trip.id),
    ]);

    const summary = buildSummary(items);
    const grouped_items = groupItems(items);
    const suggestions = buildChecklistTemplates(
      trip,
      stops,
      items.map((item) => item.item_name)
    );

    return res.status(200).json({
      success: true,
      data: {
        trip,
        stops,
        items,
        grouped_items,
        summary,
        suggestions,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createChecklistItem(req, res, next) {
  try {
    const trip = await getTripForUser(req.params.id, req.user.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const item_name = String(req.body.item_name || '').trim();
    if (!item_name) {
      return res.status(400).json({ success: false, error: 'item_name is required' });
    }

    const quantity = Number.parseInt(req.body.quantity ?? 1, 10);
    const rows = await sql`
      INSERT INTO packing_items (
        trip_id,
        item_name,
        category,
        quantity,
        priority,
        notes,
        pack_by,
        is_essential,
        is_packed,
        packed_at,
        source,
        created_at,
        updated_at
      ) VALUES (
        ${trip.id},
        ${item_name},
        ${validateCategory(req.body.category || 'other')},
        ${Number.isNaN(quantity) || quantity < 1 ? 1 : quantity},
        ${validatePriority(req.body.priority || 'medium')},
        ${req.body.notes || null},
        ${toISODate(req.body.pack_by)},
        ${Boolean(req.body.is_essential)},
        ${Boolean(req.body.is_packed)},
        ${Boolean(req.body.is_packed) ? new Date().toISOString() : null},
        ${req.body.source || 'manual'},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function bulkCreateChecklistItems(req, res, next) {
  try {
    const trip = await getTripForUser(req.params.id, req.user.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ success: false, error: 'items array is required' });
    }

    const created = await sql.begin(async (tx) => {
      const rows = [];

      for (const rawItem of items) {
        const item_name = String(rawItem?.item_name || '').trim();
        if (!item_name) {
          continue;
        }

        const [row] = await tx`
          INSERT INTO packing_items (
            trip_id,
            item_name,
            category,
            quantity,
            priority,
            notes,
            pack_by,
            is_essential,
            is_packed,
            packed_at,
            source,
            created_at,
            updated_at
          ) VALUES (
            ${trip.id},
            ${item_name},
            ${validateCategory(rawItem.category || 'other')},
            ${Number.isNaN(Number.parseInt(rawItem.quantity ?? 1, 10)) || Number.parseInt(rawItem.quantity ?? 1, 10) < 1 ? 1 : Number.parseInt(rawItem.quantity ?? 1, 10)},
            ${validatePriority(rawItem.priority || 'medium')},
            ${rawItem.notes || null},
            ${toISODate(rawItem.pack_by)},
            ${Boolean(rawItem.is_essential)},
            ${Boolean(rawItem.is_packed)},
            ${Boolean(rawItem.is_packed) ? new Date().toISOString() : null},
            ${rawItem.source || 'template'},
            NOW(),
            NOW()
          )
          RETURNING *
        `;

        rows.push(row);
      }

      return rows;
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
}

export async function updateChecklistItem(req, res, next) {
  try {
    const trip = await getTripForUser(req.params.id, req.user.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const rows = await sql`
      SELECT *
      FROM packing_items
      WHERE id = ${req.params.itemId} AND trip_id = ${trip.id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const updates = [];
    const values = [];

    if (Object.prototype.hasOwnProperty.call(req.body, 'item_name')) {
      updates.push(`item_name = $${values.length + 1}`);
      values.push(String(req.body.item_name || '').trim());
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'category')) {
      updates.push(`category = $${values.length + 1}`);
      values.push(validateCategory(req.body.category));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'quantity')) {
      updates.push(`quantity = $${values.length + 1}`);
      const quantity = Number.parseInt(req.body.quantity, 10);
      values.push(Number.isNaN(quantity) || quantity < 1 ? 1 : quantity);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'priority')) {
      updates.push(`priority = $${values.length + 1}`);
      values.push(validatePriority(req.body.priority));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'notes')) {
      updates.push(`notes = $${values.length + 1}`);
      values.push(req.body.notes || null);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'pack_by')) {
      updates.push(`pack_by = $${values.length + 1}`);
      values.push(toISODate(req.body.pack_by));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'is_essential')) {
      updates.push(`is_essential = $${values.length + 1}`);
      values.push(Boolean(req.body.is_essential));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'is_packed')) {
      updates.push(`is_packed = $${values.length + 1}`);
      values.push(Boolean(req.body.is_packed));
      updates.push(`packed_at = $${values.length + 1}`);
      values.push(Boolean(req.body.is_packed) ? new Date().toISOString() : null);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'source')) {
      updates.push(`source = $${values.length + 1}`);
      values.push(req.body.source || 'manual');
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields provided' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.params.itemId);

    const updated = await sql.unsafe(
      `UPDATE packing_items
       SET ${updates.join(', ')}
       WHERE id = $${values.length} AND trip_id = ${trip.id}
       RETURNING *`,
      values
    );

    if (updated.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    return res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    return next(error);
  }
}

export async function toggleChecklistItem(req, res, next) {
  try {
    const trip = await getTripForUser(req.params.id, req.user.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const rows = await sql`
      UPDATE packing_items
      SET
        is_packed = NOT is_packed,
        packed_at = CASE WHEN is_packed THEN NULL ELSE NOW() END,
        updated_at = NOW()
      WHERE id = ${req.params.itemId} AND trip_id = ${trip.id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function deleteChecklistItem(req, res, next) {
  try {
    const trip = await getTripForUser(req.params.id, req.user.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const rows = await sql`
      DELETE FROM packing_items
      WHERE id = ${req.params.itemId} AND trip_id = ${trip.id}
      RETURNING id
    `;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    return res.status(200).json({ success: true, data: { message: 'Item deleted successfully' } });
  } catch (error) {
    return next(error);
  }
}

export async function resetChecklist(req, res, next) {
  try {
    const trip = await getTripForUser(req.params.id, req.user.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const rows = await sql`
      UPDATE packing_items
      SET is_packed = false, packed_at = null, updated_at = NOW()
      WHERE trip_id = ${trip.id}
      RETURNING id
    `;

    return res.status(200).json({ success: true, data: { reset_count: rows.length } });
  } catch (error) {
    return next(error);
  }
}
