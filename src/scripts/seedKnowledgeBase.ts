import { documentIngestor } from '@/services/rag/documentIngestor';

const FAQ_DOCUMENTS = [
  {
    title: 'Tasty Food – HALAL Certification',
    content: `Tasty Food est certifié HALAL par un organisme de certification reconnu. Toute notre viande provient de fournisseurs certifiés HALAL. 

Nos burgers utilisent exclusivement de la viande bovine 100% halal, préparée selon les normes islamiques strictes. Nous garantissons la traçabilité complète de nos approvisionnements.

Les certificats HALAL sont disponibles sur demande en restaurant et peuvent être consultés à tout moment. Nous renouvelons nos certifications annuellement.

Pour toute question sur nos pratiques HALAL, contactez-nous au +32 4 XXX XXXX.`,
    source: 'faq' as const,
    language: 'fr' as const,
    tags: ['halal', 'certification', 'dietary', 'meat', 'suppliers'],
  },
  {
    title: 'Allergies et Ingrédients',
    content: `Tasty Food prend les allergies alimentaires très au sérieux.

Allergènes présents:
- Gluten (pain)
- Œufs (sauces)
- Lactose (fromage, sauces)
- Sésame (pain)
- Moutarde (sauces)

Options sans gluten: Nous proposons des burgers avec pain sans gluten sur demande (+1€).
Options végétariennes: Burger végétarien avec galette de légumes disponible.
Sans lactose: Possibilité de retirer le fromage et utiliser des sauces sans lactose.

Attention: Notre cuisine manipule tous ces allergènes. Des traces peuvent être présentes malgré nos précautions.

Pour toute allergie sévère, merci de nous contacter avant commande au +32 4 XXX XXXX.`,
    source: 'faq' as const,
    language: 'fr' as const,
    tags: ['allergies', 'ingredients', 'gluten', 'dietary', 'vegetarian'],
  },
  {
    title: 'Horaires et Localisation',
    content: `Tasty Food dispose de 4 succursales à Liège:

1. **Tasty Food Angleur**
   - Adresse: 123 Rue d'Angleur, 4031 Angleur
   - Téléphone: +32 4 XXX XXXX
   - Horaires: Lun-Ven 11h-23h, Sam-Dim 10h-00h

2. **Tasty Food Saint-Gilles**
   - Adresse: 456 Rue de Saint-Gilles, 4000 Liège
   - Téléphone: +32 4 YYY YYYY
   - Horaires: Lun-Ven 11h-23h, Sam-Dim 10h-00h

3. **Tasty Food Wandre**
   - Adresse: 789 Rue de Wandre, 4020 Wandre
   - Téléphone: +32 4 ZZZ ZZZZ
   - Horaires: Lun-Ven 11h-23h, Sam-Dim 10h-00h

4. **Tasty Food Seraing**
   - Adresse: 101 Rue de Seraing, 4100 Seraing
   - Téléphone: +32 4 AAA AAAA
   - Horaires: Lun-Ven 11h-23h, Sam-Dim 10h-00h

Tous nos restaurants sont ouverts les jours fériés (horaires du dimanche).

Livraison disponible via Uber Eats, Deliveroo, et Takeaway dans un rayon de 5km autour de chaque restaurant.`,
    source: 'faq' as const,
    language: 'fr' as const,
    tags: ['hours', 'location', 'branch', 'address', 'phone', 'delivery'],
  },
  {
    title: 'Politique de Remboursement',
    content: `Politique de remboursement Tasty Food:

**Conditions de remboursement:**
- Commande non reçue après 90 minutes
- Commande incomplète (articles manquants)
- Commande incorrecte (mauvais articles)
- Problème de qualité (nourriture froide, mal préparée)

**Processus:**
1. Contactez-nous dans les 2 heures suivant la livraison
2. Fournissez votre numéro de commande
3. Décrivez le problème avec photos si possible
4. Nous traitons la demande sous 24-48h

**Délais:**
- Remboursement traité sous 5 jours ouvrables
- Crédit retourné sur le mode de paiement original
- Pour les paiements en espèces: crédit restaurant

**Contact:**
Email: support@tastyfood.be
Téléphone: +32 4 XXX XXXX (Lun-Ven 9h-18h)

Nous nous engageons à résoudre tout problème rapidement et équitablement.`,
    source: 'policy' as const,
    language: 'fr' as const,
    tags: ['refund', 'policy', 'complaint', 'guarantee', 'customer-service'],
  },
];

export async function seedKnowledgeBase() {
  console.log('🌱 Seeding knowledge base...');

  try {
    for (const doc of FAQ_DOCUMENTS) {
      console.log(`   📄 Ingesting: ${doc.title}`);
      await documentIngestor.ingestDocument(
        doc.title, 
        doc.content, 
        doc.source, 
        doc.language, 
        doc.tags
      );
    }

    console.log('✅ Knowledge base seeded successfully!');
    console.log(`   Total documents: ${FAQ_DOCUMENTS.length}`);
  } catch (error) {
    console.error('❌ Knowledge base seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedKnowledgeBase().catch(console.error);
}
