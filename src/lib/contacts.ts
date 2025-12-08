// Centralized contact config — update these values like an env file.
const CONTACTS = {
  gmail: "support@tradeone.example",
  gmailComposeUrl: (email = "support@tradeone.example") =>
    `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(email)}`,
  instagram: "https://instagram.com/your_instagram",
  youtube: "https://www.youtube.com/your_channel",
  discord: "https://discord.gg/your_invite",
};

export default CONTACTS;
