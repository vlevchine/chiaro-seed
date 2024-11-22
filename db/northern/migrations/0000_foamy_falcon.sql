CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`start` text DEFAULT (CURRENT_DATE),
	`end` text,
	`createdby` integer NOT NULL,
	FOREIGN KEY (`createdby`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `start_index` ON `projects` (`start`);--> statement-breakpoint
CREATE INDEX `end_index` ON `projects` (`end`);--> statement-breakpoint
CREATE UNIQUE INDEX `time_unique_constraint` ON `projects` (`start`,`createdby`);--> statement-breakpoint
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`locale` text,
	`timezone` text,
	`engineering` integer,
	`partner` integer,
	`auditor` integer,
	`vendor` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`username` text,
	`email` text,
	`roles` text NOT NULL,
	`approval_level` integer DEFAULT 0,
	`affiliation_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`deactivated_at` integer,
	FOREIGN KEY (`affiliation_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `wells` (
	`id` text PRIMARY KEY NOT NULL,
	`well_id` text NOT NULL,
	`name` text,
	`location` text,
	`depth` real,
	`active` integer,
	FOREIGN KEY (`well_id`) REFERENCES `wells`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wells_name_unique` ON `wells` (`name`);