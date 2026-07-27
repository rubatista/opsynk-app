ALTER TABLE `products` ADD `brand` text;--> statement-breakpoint
ALTER TABLE `products` ADD `model` text;--> statement-breakpoint
ALTER TABLE `products` ADD `capacity_kg` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `energy_type` text;--> statement-breakpoint
ALTER TABLE `products` ADD `year` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `listing_type` text DEFAULT 'venda' NOT NULL;