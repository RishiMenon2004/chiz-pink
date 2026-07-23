const authConfig = {
	providers: [
		{
			domain: "https://accounts.google.com",
			applicationID: process.env.GOOGLE_CLIENT_ID,
		},
	],
}

export default authConfig
