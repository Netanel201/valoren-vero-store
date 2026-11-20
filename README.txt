VALOREN VERO — Store + private admin panel

FILES
- index.html / style.css / script.js: public storefront
- admin.html / admin.css / admin.js: private management panel
- config.js: Supabase project URL + Publishable key
- supabase-setup.sql: database, access policies, and image storage setup

IMPORTANT
The storefront starts empty. Products appear only after you publish them in admin.html.
The admin panel uses Supabase Auth (email + password) and database/storage Row Level Security.
Do NOT put a Supabase service_role/secret key in config.js or in GitHub.

SETUP (one time)
1. Create a free project at https://supabase.com.
2. In Supabase > SQL Editor, run the entire supabase-setup.sql file.
3. In Supabase > Authentication > Users, choose Add user and create your admin email/password.
   Turn OFF public signups in Authentication > Settings > Auth Providers > Email (wording may vary).
   Keep only the user you created as admin.
4. Copy your new user's UUID from Authentication > Users.
5. In SQL Editor, run this command, replacing the UUID:
   insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
6. In Project Settings > API, copy the Project URL and Publishable key.
   Paste them into config.js. Never use the secret/service_role key.
7. Upload ALL files in this folder to the root of your GitHub Pages repository.
   Include config.js, admin.html, admin.js, admin.css, supabase-setup.sql and the existing storefront files.
8. Open your published site and go to /admin.html to sign in.

USING THE ADMIN
- Sign in with the email/password you created in Supabase.
- Add a product name, price, category and description.
- Select available sizes and enter colors separated by commas.
- Optionally set a stock number (this version stores a default stock value, not live per-size inventory).
- Upload a JPG, PNG or WebP image up to 5 MB.
- Tick "Publish product in the store" to make it visible to customers.
- Use Edit, Hide/Publish, and Delete in the product list.

CURRENT LIMITATIONS
- Product management and image uploads are connected to Supabase once configured.
- Orders still go to WhatsApp; this does NOT process card payments or connect to Migvan4u.
- Stock is stored as one default number per product, not tracked or deducted per size.
- The image bucket is public so published product images can load on the public storefront. Never upload private images there.
- GitHub Pages is static hosting; the protected data operations are enforced by Supabase RLS, not by hiding the admin page.
- Add your WhatsApp number in script.js before using WhatsApp ordering.
