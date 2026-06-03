-- Demo data for lupylloyd@gmail.com (Clerk user_3EP9VyVe7h4zDnfXY7BXKWNPoju)
-- Run: npm run db:seed:demo

INSERT INTO "Organization" (id, name, "createdAt", "updatedAt")
VALUES ('org_lupylloyd_demo', 'Brett''s Company', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "User" (
  id, "clerkId", email, "firstName", "lastName", role, "organizationId", "createdAt", "updatedAt"
) VALUES (
  'user_lupylloyd_demo',
  'user_3EP9VyVe7h4zDnfXY7BXKWNPoju',
  'lupylloyd@gmail.com',
  'Brett',
  'Lloyd',
  'OWNER',
  'org_lupylloyd_demo',
  NOW(),
  NOW()
)
ON CONFLICT ("clerkId") DO UPDATE SET
  email = EXCLUDED.email,
  "organizationId" = EXCLUDED."organizationId",
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName";

INSERT INTO "ProductionPartner" (id, name, "apiKey", "isActive", "createdAt")
VALUES ('seed_default_partner', 'Default Print Partner', 'seed_change_in_ops', true, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Campaign" (
  id, "organizationId", name, size, quantity, "productType", "productSlug",
  "totalPriceCents", "unitPriceCents", status, notes, "createdAt", "updatedAt"
) VALUES (
  'camp_draft_lupy', 'org_lupylloyd_demo', 'Spring EDDM — Draft', '6x11', 3200, 'EDDM',
  'every-door-direct-mail', 16800, 5, 'DRAFT',
  'Sample draft — finish targeting and artwork in My campaigns.', NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO "Campaign" (
  id, "organizationId", name, size, quantity, "productType", "productSlug",
  "totalPriceCents", "unitPriceCents", status, "paidAt", "amountPaidCents", "createdAt", "updatedAt"
) VALUES (
  'camp_prod_lupy', 'org_lupylloyd_demo', 'Neighborhood Saturation Mail', '6x11', 2500, 'EDDM',
  'every-door-direct-mail', 12500, 5, 'IN_PRODUCTION', NOW(), 12500, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO "ProductionJob" (
  id, "campaignId", "productionPartnerId", status, payload, "createdAt", "updatedAt"
) VALUES (
  'job_prod_lupy', 'camp_prod_lupy', 'seed_default_partner', 'RECEIVED',
  '{"campaignName":"Neighborhood Saturation Mail","size":"6x11","quantity":2500}'::jsonb,
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO "JobEvent" (id, "productionJobId", status, note, actor, "createdAt")
VALUES (
  'evt_prod_lupy', 'job_prod_lupy', 'RECEIVED',
  'Order activated. Assigned to Default Print Partner', 'system:demo-seed', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO "MailingJob" (
  id, "campaignId", type, status, "estimatedTotalCents", "createdAt", "updatedAt"
) VALUES (
  'mail_prod_lupy', 'camp_prod_lupy', 'EDDM', 'PENDING', 12500, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO "Campaign" (
  id, "organizationId", name, size, quantity, "productType", "productSlug",
  "totalPriceCents", "unitPriceCents", status, "paidAt", "amountPaidCents", "createdAt", "updatedAt"
) VALUES (
  'camp_ship_lupy', 'org_lupylloyd_demo', 'Targeted Movers Campaign', '4x6', 1800, 'TARGETED',
  'targeted-direct-mail', 9900, 5, 'IN_PRODUCTION', NOW() - INTERVAL '3 days', 9900, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO "ProductionJob" (
  id, "campaignId", "productionPartnerId", status, "trackingNumber", "shippedAt",
  payload, "createdAt", "updatedAt"
) VALUES (
  'job_ship_lupy', 'camp_ship_lupy', 'seed_default_partner', 'SHIPPED', '1Z999AA10123456784',
  NOW() - INTERVAL '2 days',
  '{"campaignName":"Targeted Movers Campaign","size":"4x6","quantity":1800}'::jsonb,
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO "JobEvent" (id, "productionJobId", status, note, actor, "createdAt")
VALUES (
  'evt_ship_lupy', 'job_ship_lupy', 'SHIPPED',
  'Demo shipment — tracking 1Z999AA10123456784', 'system:demo-seed', NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO "MailingJob" (
  id, "campaignId", type, status, "estimatedTotalCents", "createdAt", "updatedAt"
) VALUES (
  'mail_ship_lupy', 'camp_ship_lupy', 'TARGETED', 'PENDING', 9900, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
