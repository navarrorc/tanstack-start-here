CREATE TABLE "marketplace_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
-- Insert initial marketplace types
INSERT INTO "marketplace_types" ("name") VALUES
	('eBay'),
	('Poshmark'),
	('Whatnot'),
	('TikTok Shop'),
	('Amazon'),
	('Mercari'),
	('Facebook Marketplace'),
	('Depop'),
	('Bonanza'),
	('OfferUp');
--> statement-breakpoint
ALTER TABLE "marketplaces" DROP CONSTRAINT "marketplaces_user_id_name_unique";--> statement-breakpoint
ALTER TABLE "marketplaces" ADD COLUMN "marketplace_type_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "marketplaces" ADD CONSTRAINT "marketplaces_marketplace_type_id_marketplace_types_id_fk" FOREIGN KEY ("marketplace_type_id") REFERENCES "public"."marketplace_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplaces" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "marketplaces" ADD CONSTRAINT "marketplaces_user_id_marketplace_type_id_unique" UNIQUE("user_id","marketplace_type_id");