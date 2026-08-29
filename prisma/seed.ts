import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.response.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.mirrorTemplate.deleteMany();
  await prisma.admin.deleteMany();

  // Seed scenarios
  const scenarios = [
    // ID
    {
      language: "id",
      text: "Tim-mu baru saja gagal memenuhi deadline besar. Apa yang langsung ada di kepalamu?",
      category: "toward-away",
      order: 1,
    },
    {
      language: "id",
      text: "Kamu sedang menyusun target untuk kuartal berikutnya. Bagaimana kamu menuliskannya dalam satu kalimat ke tim?",
      category: "toward-away",
      order: 2,
    },
    {
      language: "id",
      text: "Seorang bawahan datang minta saran soal karier. Apa pertanyaan pertama yang kamu ajukan ke dia?",
      category: "toward-away",
      order: 3,
    },
    {
      language: "id",
      text: "Rapat evaluasi tahunan akan datang. Apa yang ingin kamu pastikan TIDAK terjadi lagi tahun ini?",
      category: "toward-away",
      order: 4,
    },
    // EN
    {
      language: "en",
      text: "Your team just failed to meet a major deadline. What immediately comes to your mind?",
      category: "toward-away",
      order: 1,
    },
    {
      language: "en",
      text: "You are setting targets for the next quarter. How would you write it in one sentence to the team?",
      category: "toward-away",
      order: 2,
    },
    {
      language: "en",
      text: "A subordinate comes to ask for career advice. What is the first question you ask them?",
      category: "toward-away",
      order: 3,
    },
    {
      language: "en",
      text: "The annual evaluation meeting is coming up. What do you want to make sure DOES NOT happen again this year?",
      category: "toward-away",
      order: 4,
    },
    // NL
    {
      language: "nl",
      text: "Je team heeft net een belangrijke deadline gemist. Wat komt er direct in je op?",
      category: "toward-away",
      order: 1,
    },
    {
      language: "nl",
      text: "Je stelt doelen op voor het volgende kwartaal. Hoe schrijf je dit in één zin aan het team?",
      category: "toward-away",
      order: 2,
    },
    {
      language: "nl",
      text: "Een ondergeschikte komt om loopbaanadvies vragen. Wat is de eerste vraag die je stelt?",
      category: "toward-away",
      order: 3,
    },
    {
      language: "nl",
      text: "De jaarlijkse evaluatievergadering komt eraan. Wat wil je ervoor zorgen dat dit jaar NIET meer gebeurt?",
      category: "toward-away",
      order: 4,
    },
  ];

  for (const s of scenarios) {
    await prisma.scenario.create({ data: s });
  }

  // Seed keywords
  const keywords = [
    // ID toward
    ...[
      "mencapai", "ingin", "supaya bisa", "menuju", "meraih", "hasil yang", "target"
    ].map(phrase => ({ language: "id", category: "toward-away", phrase, direction: "toward" })),
    // ID away
    ...[
      "menghindari", "supaya tidak", "jangan sampai", "mencegah", "biar tidak", "masalahnya"
    ].map(phrase => ({ language: "id", category: "toward-away", phrase, direction: "away" })),
    
    // EN toward
    ...[
      "achieve", "want", "goal", "towards", "obtain", "result", "target"
    ].map(phrase => ({ language: "en", category: "toward-away", phrase, direction: "toward" })),
    // EN away
    ...[
      "avoid", "prevent", "so we don't", "problem", "don't want", "stop"
    ].map(phrase => ({ language: "en", category: "toward-away", phrase, direction: "away" })),

    // NL toward
    ...[
      "bereiken", "willen", "doel", "naar", "krijgen", "resultaat", "target"
    ].map(phrase => ({ language: "nl", category: "toward-away", phrase, direction: "toward" })),
    // NL away
    ...[
      "vermijden", "voorkomen", "zodat we niet", "probleem", "niet willen", "stoppen"
    ].map(phrase => ({ language: "nl", category: "toward-away", phrase, direction: "away" }))
  ];

  for (const k of keywords) {
    await prisma.keyword.create({ data: k });
  }

  // Seed mirror templates
  const mirrorTemplates = [
    {
      language: "id",
      category: "toward-away",
      template: "Dari {count} hal yang kamu ceritakan, kamu {toward_count} kali menjelaskan langkahmu lewat apa yang ingin kamu capai — dan {away_count} kali lewat apa yang ingin kamu hindari. Bukan berarti salah satu lebih baik — tapi tim-mu mendengar polanya juga, setiap hari.",
    },
    {
      language: "id",
      category: "toward-away",
      template: "Kamu cenderung bicara dengan pola {dominant_pattern}. Dari {count} situasi, {toward_count} jawaban fokus pada tujuan yang ingin dicapai, dan {away_count} pada hal yang ingin dihindari. Tidak ada yang salah — tapi menarik untuk disadari, bukan?",
    },
    {
      language: "en",
      category: "toward-away",
      template: "Out of {count} things you shared, you explained your steps {toward_count} times through what you want to achieve — and {away_count} times through what you want to avoid. It doesn't mean one is better than the other — but your team hears the pattern too, every day.",
    },
    {
      language: "en",
      category: "toward-away",
      template: "You tend to speak with a {dominant_pattern} pattern. Out of {count} situations, {toward_count} answers focused on goals to achieve, and {away_count} on things to avoid. There is nothing wrong with it — but interesting to realize, isn't it?",
    },
    {
      language: "nl",
      category: "toward-away",
      template: "Van de {count} dingen die je deelde, heb je je stappen {toward_count} keer uitgelegd via wat je wilt bereiken — en {away_count} keer via wat je wilt vermijden. Het betekent niet dat de een beter is dan de ander — maar je team hoort het patroon ook, elke dag.",
    },
    {
      language: "nl",
      category: "toward-away",
      template: "Je praat vaak met een {dominant_pattern} patroon. Van de {count} situaties, focusten {toward_count} antwoorden op te bereiken doelen, en {away_count} op dingen om te vermijden. Er is niets mis mee — maar het is interessant om te beseffen, nietwaar?",
    }
  ];

  for (const m of mirrorTemplates) {
    await prisma.mirrorTemplate.create({ data: m });
  }

  // Seed admin
  await prisma.admin.create({
    data: {
      email: "admin@nlp-institute.com",
      passwordHash: hashSync("admin123", 10),
    },
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
