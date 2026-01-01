import prismaClient from "@/lib/prisma/client";
import nextAuth from "next-auth";

export default nextAuth({
  providers: [
    CredentialsProvider(
      {
        name: "Credentials",

        credentials: {
          username: {
            label: "Email",
            type: "text",
            placeholder: "Enter your email",
          },
          password: {
            label: "Password",
            type: "password",
            placeholder: "Enter your password",
          },
        }
      },
      async (credentials) => {
        user = prismaClient.user.findUnique({
        email: credentials?.username,
        }),
        
        if(!user){
          return null;
        }

        passwordMatch = await bcrypt.compare( user.password, credentials?.password );

        if(passwordMatch){
          token = genrateToken(user.id);
          return token;
        }
      } 
     )
  ]
});
