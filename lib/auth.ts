import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "./supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Save/update user in database on sign in
      if (user.email && account) {
        try {
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

          if (existingUser) {
            // Update existing user's last sign in
            await supabaseAdmin
              .from('users')
              .update({
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                last_sign_in_at: new Date().toISOString(),
              })
              .eq('email', user.email);
          } else {
            // Create new user
            await supabaseAdmin
              .from('users')
              .insert({
                email: user.email,
                name: user.name || '',
                image: user.image || '',
                provider: account.provider,
                provider_id: account.providerAccountId,
                role: 'Member', // Default role
                last_sign_in_at: new Date().toISOString(),
              });
          }
        } catch (error) {
          console.error('Error saving user to database:', error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
};

