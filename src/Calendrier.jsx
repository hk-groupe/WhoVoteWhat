import React from 'react'

// Élections à venir en France et en Europe, avec le rôle de chaque scrutin.
// Dates et descriptifs issus des sources institutionnelles officielles.
const ELECTIONS = [
  {
    date: 'Septembre 2026 (date fixée par décret)',
    titre: "Élections sénatoriales",
    lieu: 'France',
    emoji: '🏛️',
    qui: 'Les grands électeurs : députés, sénateurs sortants, conseillers départementaux, régionaux et municipaux des communes.',
    missions: 'Renouvelle la moitié du Sénat (série 1 : 170 sièges). Le Sénat vote la loi au même titre que l\'Assemblée nationale, représente les collectivités territoriales et peut contrôler le gouvernement.',
  },
  {
    date: 'Janvier – avril 2027',
    titre: 'Élection présidentielle (deux tours, à ~3 semaines d\'écart)',
    lieu: 'France',
    emoji: '🗳️',
    qui: 'Le peuple français : tous les électeurs inscrits sur les listes électorales.',
    missions: 'Élit le président de la République pour 5 ans. Le président nomme le Premier ministre, est chef des armées, garant du fonctionnement des institutions et de la continuité de l\'État.',
  },
  {
    date: 'Juin – juillet 2027 (prévu)',
    titre: 'Élections municipales',
    lieu: 'France',
    emoji: '🏙️',
    qui: 'Les électeurs de chaque commune.',
    missions: 'Élit les conseils municipaux pour 6 ans. Ils élisent le maire, qui gère la commune : état civil, écoles primaires, urbanisme, action sociale de proximité, police municipale.',
  },
  {
    date: 'Mars 2028 (prévu)',
    titre: 'Élections cantonales (départementales)',
    lieu: 'France',
    emoji: '🗺️',
    qui: 'Les électeurs de chaque canton.',
    missions: 'Renouvelle les conseils départementaux pour 6 ans. Ils gèrent les collèges, les routes départementales, l\'action sociale (RSA, protection de l\'enfance) et les transports scolaires.',
  },
  {
    date: 'Mars 2028 (prévu)',
    titre: 'Élections régionales',
    lieu: 'France',
    emoji: '🏞️',
    qui: 'Les électeurs de chaque région.',
    missions: 'Renouvelle les conseils régionaux pour 6 ans. Ils gèrent les lycées, le développement économique régional, les transports (TER) et la formation professionnelle.',
  },
  {
    date: 'Mai – juin 2029 (prévu)',
    titre: 'Élections européennes',
    lieu: 'Europe (France)',
    emoji: '🇪🇺',
    qui: 'Les citoyens européens résidant en France.',
    missions: 'Élit les députés européens français au Parlement européen pour 5 ans. Ils votent les directives et règlements européens (environnement, marché unique, numérique) et le budget de l\'Union.',
  },
  {
    date: 'Mars 2031 (prévu)',
    titre: 'Élections départementales',
    lieu: 'France',
    emoji: '🛤️',
    qui: 'Les électeurs de chaque canton.',
    missions: 'Élection de milieu de mandats locaux : renouvelle les conseils départementaux. Mêmes missions que les cantonales : collèges, solidarité, routes.',
  },
  {
    date: 'Octobre 2032 (prévu)',
    titre: 'Élections législatives',
    lieu: 'France',
    emoji: '⚖️',
    qui: 'Les électeurs de chaque circonscription.',
    missions: 'Élit les 577 députés de l\'Assemblée nationale pour 5 ans. Les députés votent les lois, contrôlent le gouvernement et peuvent renverser le gouvernement par une motion de censure.',
  },
]

export default function Calendrier() {
  return (
    <section className="calendrier-page">
      <div className="bloc">
        <h2>📅 Le calendrier des élections</h2>
        <p>
          Toutes les élections à venir en France et en Europe, avec le rôle de chaque scrutin : qui l'on élit, pour
          quelles missions. Les dates exactes sont fixées par décret ; les élections municipales 2027 suivront la
          présidentielle conformément au calendrier institutionnel.
        </p>
      </div>
      {ELECTIONS.map((e) => (
        <div key={e.titre} className="carte-election">
          <div className="entete-election">
            <span className="emoji-election">{e.emoji}</span>
            <div>
              <h3>{e.titre}</h3>
              <p className="meta-election">📍 {e.lieu} · 🗓️ {e.date}</p>
            </div>
          </div>
          <p><strong>Qui on élit :</strong> {e.qui}</p>
          <p><strong>Pour quelles missions :</strong> {e.missions}</p>
        </div>
      ))}
    </section>
  )
}
