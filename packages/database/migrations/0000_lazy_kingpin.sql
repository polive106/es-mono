CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`industry` text NOT NULL,
	`size` text NOT NULL,
	`location` text NOT NULL,
	`invite_code` text NOT NULL,
	`credit_balance` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `companies_name_unique` ON `companies` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `companies_invite_code_unique` ON `companies` (`invite_code`);--> statement-breakpoint
CREATE INDEX `idx_companies_invite_code` ON `companies` (`invite_code`);--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`resource` text NOT NULL,
	`action` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permissions_name_unique` ON `permissions` (`name`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`scope` text DEFAULT 'system' NOT NULL,
	`company_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`company_id` text NOT NULL,
	`assigned_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_user_roles_user_id` ON `user_roles` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_user_roles_role_id` ON `user_roles` (`role_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_role_company` ON `user_roles` (`user_id`,`role_id`,`company_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`language_pref` text DEFAULT 'en' NOT NULL,
	`company_id` text NOT NULL,
	`last_activity_at` integer NOT NULL,
	`is_anonymized` integer DEFAULT false NOT NULL,
	`anonymized_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_company_id` ON `users` (`company_id`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_user_id` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`is_approved` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_skills_name` ON `skills` (`name`);--> statement-breakpoint
CREATE INDEX `idx_skills_category` ON `skills` (`category`);--> statement-breakpoint
CREATE TABLE `talent_availability` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`availability_pct` integer DEFAULT 0 NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`is_anonymized` integer DEFAULT true NOT NULL,
	`active_from` integer,
	`active_until` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `talent_availability_user_id_unique` ON `talent_availability` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_talent_availability_pct` ON `talent_availability` (`availability_pct`);--> statement-breakpoint
CREATE TABLE `user_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`skill_id` text NOT NULL,
	`proficiency_level` text NOT NULL,
	`years_experience` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_user_skills_user_id` ON `user_skills` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_user_skills_skill_id` ON `user_skills` (`skill_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_skill` ON `user_skills` (`user_id`,`skill_id`);--> statement-breakpoint
CREATE TABLE `approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`mission_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`approver_user_id` text,
	`comments` text,
	`approved_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`approver_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_approvals_mission_id` ON `approvals` (`mission_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_mission_type` ON `approvals` (`mission_id`,`type`);--> statement-breakpoint
CREATE TABLE `missions` (
	`id` text PRIMARY KEY NOT NULL,
	`proposing_company_id` text NOT NULL,
	`receiving_company_id` text NOT NULL,
	`talent_user_id` text NOT NULL,
	`skill_need_id` text,
	`duration_months` integer NOT NULL,
	`time_commitment_hrs_week` integer NOT NULL,
	`credit_value` integer NOT NULL,
	`status` text DEFAULT 'proposed' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`proposing_company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receiving_company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`talent_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`skill_need_id`) REFERENCES `skill_needs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_missions_proposing_company` ON `missions` (`proposing_company_id`);--> statement-breakpoint
CREATE INDEX `idx_missions_receiving_company` ON `missions` (`receiving_company_id`);--> statement-breakpoint
CREATE INDEX `idx_missions_talent_user` ON `missions` (`talent_user_id`);--> statement-breakpoint
CREATE INDEX `idx_missions_status` ON `missions` (`status`);--> statement-breakpoint
CREATE TABLE `ndas` (
	`id` text PRIMARY KEY NOT NULL,
	`mission_id` text NOT NULL,
	`proposing_company_signer_id` text NOT NULL,
	`receiving_company_signer_id` text NOT NULL,
	`document_url` text NOT NULL,
	`signed_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proposing_company_signer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receiving_company_signer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ndas_mission_id_unique` ON `ndas` (`mission_id`);--> statement-breakpoint
CREATE TABLE `skill_needs` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`skill_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`duration_months` integer NOT NULL,
	`time_commitment_hrs_week` integer NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_skill_needs_company_id` ON `skill_needs` (`company_id`);--> statement-breakpoint
CREATE INDEX `idx_skill_needs_skill_id` ON `skill_needs` (`skill_id`);--> statement-breakpoint
CREATE INDEX `idx_skill_needs_status` ON `skill_needs` (`status`);--> statement-breakpoint
CREATE TABLE `time_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`mission_id` text NOT NULL,
	`user_id` text NOT NULL,
	`hours_worked` integer NOT NULL,
	`work_date` integer NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_time_logs_mission_id` ON `time_logs` (`mission_id`);--> statement-breakpoint
CREATE INDEX `idx_time_logs_user_id` ON `time_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE `credit_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`mission_id` text,
	`initiated_by_user_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`initiated_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_credit_transactions_company_id` ON `credit_transactions` (`company_id`);--> statement-breakpoint
CREATE INDEX `idx_credit_transactions_type` ON `credit_transactions` (`type`);--> statement-breakpoint
CREATE INDEX `idx_credit_transactions_mission_id` ON `credit_transactions` (`mission_id`);