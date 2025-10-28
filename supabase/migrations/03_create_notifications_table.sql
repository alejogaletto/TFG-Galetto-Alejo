-- Create Notification table for internal notification system
CREATE TABLE "Notification" (
  "id" SERIAL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT,
  "metadata" JSONB,
  "is_read" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "read_at" TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX "idx_notification_user_id" ON "Notification"("user_id");
CREATE INDEX "idx_notification_is_read" ON "Notification"("is_read");
CREATE INDEX "idx_notification_created_at" ON "Notification"("created_at" DESC);
CREATE INDEX "idx_notification_user_unread" ON "Notification"("user_id", "is_read") WHERE "is_read" = FALSE;

-- Comment on notification types
COMMENT ON COLUMN "Notification"."type" IS 'Types: form_submission, registry_created, workflow_completed, solution_deployed, form_created, database_created';

