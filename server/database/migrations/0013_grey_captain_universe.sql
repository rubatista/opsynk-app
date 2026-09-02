ALTER TABLE `client_transactions` ADD `sale_id` integer REFERENCES sales(id) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `sales` ADD `amount_due` real DEFAULT 0 NOT NULL;