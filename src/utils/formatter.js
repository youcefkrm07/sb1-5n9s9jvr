export function formatAccountInfo(data) {
  return (
    "📋 Account Information:\n\n" +
    `👤 Name: ${data.prenom || ''} ${data.nom || ''}\n` +
    `📞 ND: ${data.nd || ''}\n` +
    `📍 Address: ${data.adresse || ''}\n` +
    `📦 Offer: ${data.offre || ''}\n` +
    `⚡ Speed: ${data.speed || ''} Mbps\n` +
    `💳 Credit: ${data.credit || '0'} DA\n` +
    `💰 Balance: ${data.balance || '0'} DA\n` +
    `📅 Expiry Date: ${data.dateexp || ''}\n` +
    `📱 Mobile: ${data.mobile || ''}\n` +
    `📧 Email: ${data.email || ''}\n` +
    `🔢 NCLI: ${data.ncli || ''}\n` +
    `📊 Status: ${data.status || ''}\n` +
    `📝 Type: ${data.type1 || ''}`
  );
}