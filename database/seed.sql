-- Supplementary seed SQL for listings and related fixtures.
-- Users are inserted by database/init.js so passwords can be bcrypt-hashed at runtime.
-- This file is called AFTER users are inserted; it assumes user ids 1..5 exist
-- in the order: student1, student2, student3, moderator, admin.

INSERT INTO listings (owner_id, title, description, category, condition, type, price, status) VALUES
  (1, 'Calculus Early Transcendentals 8th Edition', 'Lightly used textbook, minimal highlighting. Perfect for MATH 171/172.', 'textbooks', 'good', 'sell', 45.00, 'active'),
  (1, 'Mini Fridge (works great)', 'Dorm-size fridge, moving out, need to sell fast.', 'dorm_essentials', 'like_new', 'sell', 60.00, 'active'),
  (2, 'Wireless mechanical keyboard', 'Keychron K2, bluetooth + USB-C. Barely used.', 'electronics', 'like_new', 'sell', 75.00, 'pending'),
  (2, 'Free Moving Boxes', 'About 15 boxes of various sizes. Gone by end of week.', 'dorm_essentials', 'good', 'free', NULL, 'active'),
  (3, 'Trek Road Bike', 'Trade for a mountain bike or cruiser. 54cm frame.', 'sports', 'good', 'trade', NULL, 'active'),
  (3, 'WSU Hoodie (M)', 'Crimson pullover, size medium. Washed once.', 'clothing', 'like_new', 'sell', 20.00, 'pending');

-- Sample primary images (placeholder paths)
INSERT INTO listing_images (listing_id, url, is_primary, sort_order) VALUES
  (1, '/images/placeholder-item.png', 1, 0),
  (2, '/images/placeholder-item.png', 1, 0),
  (3, '/images/placeholder-item.png', 1, 0),
  (4, '/images/placeholder-item.png', 1, 0),
  (5, '/images/placeholder-item.png', 1, 0),
  (6, '/images/placeholder-item.png', 1, 0);
