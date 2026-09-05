-- Nexora Single-Role User Architecture
--
-- Existing architecture:
--
-- user
--   └── user_role[]
--         └── role
--
-- Existing primary key:
-- PRIMARY KEY ("userId", "roleId")
--
-- This allows a single user to have multiple roles.
--
-- New architecture:
--
-- user
--   └── user_role?
--         └── role
--
-- The database will enforce that one userId can appear only once
-- inside the user_role table.
--
-- Existing role assignments are preserved.

-- ---------------------------------------------------------------------------
-- SAFETY CHECK
-- ---------------------------------------------------------------------------
--
-- Do not guess which role should survive if an existing user currently
-- has more than one role.
--
-- The migration intentionally stops before changing any constraint when
-- duplicate userId values exist.

DO $$
BEGIN
  IF EXISTS (
    SELECT "userId"
    FROM "user_role"
    GROUP BY "userId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'SINGLE_ROLE_MIGRATION_BLOCKED: one or more users currently have multiple roles';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- REMOVE OLD MANY-TO-MANY PRIMARY KEY
-- ---------------------------------------------------------------------------
--
-- Current primary key:
--
-- PRIMARY KEY ("userId", "roleId")
--
-- That composite primary key allows:
--
-- USER_A + ADMIN
-- USER_A + MANAGER
--
-- We remove it because userId itself will become unique.

ALTER TABLE "user_role"
DROP CONSTRAINT "user_role_pkey";

-- ---------------------------------------------------------------------------
-- ENFORCE ONE ROLE PER USER
-- ---------------------------------------------------------------------------
--
-- After this index exists:
--
-- USER_A + ADMIN      -> allowed
-- USER_A + MANAGER    -> rejected
--
-- PostgreSQL itself now protects the single-role invariant.

CREATE UNIQUE INDEX "user_role_userId_key"
ON "user_role"("userId");

-- ---------------------------------------------------------------------------
-- PROTECT ROLES THAT ARE STILL ASSIGNED
-- ---------------------------------------------------------------------------
--
-- Previously:
--
-- deleting Role
--     ↓
-- CASCADE
--     ↓
-- UserRole silently deleted
--
-- In the single-role model that could leave a user without its access role.
--
-- Therefore role deletion is now RESTRICTED while at least one user still
-- holds that role.

ALTER TABLE "user_role"
DROP CONSTRAINT "user_role_roleId_fkey";

ALTER TABLE "user_role"
ADD CONSTRAINT "user_role_roleId_fkey"
FOREIGN KEY ("roleId")
REFERENCES "role"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;