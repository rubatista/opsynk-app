PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_maintenances` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`equipment_id` integer NOT NULL,
	`performed_at` text NOT NULL,
	`description` text NOT NULL,
	`next_due_date` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_maintenances`("id", "performed_at", "description", "next_due_date", "created_at") SELECT "id", "performed_at", "description", "next_due_date", "created_at" FROM `maintenances`;--> statement-breakpoint
DROP TABLE `maintenances`;--> statement-breakpoint
ALTER TABLE `__new_maintenances` RENAME TO `maintenances`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
