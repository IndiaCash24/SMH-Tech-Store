# Security Specification for SMH Tech Store

## Data Invariants
1. A Review must belong to a valid Project.
2. A user can only write a review if they are authenticated and their email is verified.
3. Projects can only be modified by Admins (though currently we don't have a UI for this, we must protect the collection).
4. Ratings and Like counts are updated via client-side logic for now (though in production these should be triggered by Cloud Functions, we'll keep it simple for this applet but secure the paths).

## The Dirty Dozen Payloads (Rejection Targets)
1. Creating a project as a non-admin.
2. Updating a project's price to a negative value.
3. Creating a review with a rating > 5 or < 1.
4. Creating a review for a non-existent project (Relational Integrity).
5. Updating someone else's review.
6. Deleting a project as a non-admin.
7. Injecting 1MB of text into the `userName` field of a review.
8. Modifying the `likes` count of a project directly (if we enforce it should only increment by 1).
9. Creating a review with a spoofed `userId`.
10. Reading private user data (none currently, but a good practice).
11. Listing all projects without a filter (if we wanted to enforce one, but here listing is public).
12. Attempting to overwrite the `createdAt` timestamp.

## Firestore Rules Logic (Drafting)
- `isValidProject`: Check for required fields, types, and value bounds.
- `isValidReview`: Check for required fields, rating (1-5), and owner identity.
- `isAdmin`: Check against a hardcoded list or an admins collection.
