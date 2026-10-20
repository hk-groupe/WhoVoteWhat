import React from 'react'

// Élections à venir en France et en Europe, avec le rôle de chaque scrutin.
// Les dates exactes sont fixées par décret en début d'année électorale :
// elles ne sont pas encore disponibles, seule la fenêtre prévue par le code électoral est indiquée.
const ELECTIONS = [
  {
    date: 'Septembre 2026 (date exacte non déclarée)',
    statut: 'Fenêtre prévue par le code électoral — date non encore fixée par décret',
    titre: 'Élections sénatoriales',
    lieu: 'France',
    emoji: '🏛️',
    quiVote: 'Les grands électeurs : députés, conseillers départementaux, régionaux, municipaux et sénateurs sortants. Les citoyens n\'y votent pas directement.',
    quiElit: 'La moitié du Sénat (série 1, 170 sénateurs)',
    missions: 'Les sénateurs votent la loi au même titre que l\'Assemblée nationale, représentent les collectivités territoriales et contrôlent le gouvernement.',
  },
  {
    date: 'Avril 2027 (date exacte non déclarée)',
    statut: 'Conformément à la Constitution, la présidentielle se tient en avril du quinzième anniversaire de la précédente ; les deux dimanches de scrutin seront fixés par décret',
    titre: 'Élection présidentielle (deux tours)',
    lieu: 'France',
    emoji: '🗳️',
    quiVote: 'Les électeurs inscrits sur les listes électorales (18 ans révolus, nationalité française)',
    quiElit: 'Le président de la République pour 5 ans',
    missions: 'Le président nomme le Premier ministre, promulgue les lois, est chef des armées et garant du fonctionnement des institutions. Élu au suffrage universel direct, avec éventuel second tour entre les deux candidats arrivés en tête.',
  },
  {
    date: 'Mars 2026 pour les ultra-marins ; mars 2027 pour la métropole (dates exactes non déclarées)',
    statut: 'Fenêtre prévue — dates non encore fixées par décret',
    titre: 'Élections municipales',
    lieu: 'France (métropole + outre-mer)',
    emoji: '🏙️',
    quiVote: 'Les électeurs inscrits dans chaque commune, y compris les ressortissants de l\'Union européenne pour les listes municipales (sauf maire et adjoints)',
    quiElit: 'Les conseils municipaux (pour 6 ans)',
    missions: 'Le conseil municipal élit le maire. La commune gère : état civil, écoles primaires, urbanisme, action sociale de proximité, police municipale.',
  },
  {
    date: 'Mars 2028 (date exacte non déclarée)',
    statut: 'Fenêtre prévue — dates non encore fixées par décret',
    titre: 'Élections cantonales',
    lieu: 'France',
    emoji: '🗺️',
    quiVote: 'Les électeurs inscrits dans chaque canton (circonscription électorale du département)',
    quiElit: 'Les conseillers départementaux (pour 6 ans, binômes femme-homme par canton)',
    missions: 'Le conseil départemental gère les collèges, les routes départementales, l\'action sociale (RSA, protection de l\'enfance) et les transports scolaires.',
  },
  {
    date: 'Mars 2028 (date exacte non déclarée)',
    statut: 'Fenêtre prévue — dates non encore fixées par décret',
    titre: 'Élections régionales',
    lieu: 'France',
    emoji: '🏞️',
    quiVote: 'Les électeurs inscrits dans chaque région',
    quiElit: 'Les conseillers régionaux (pour 6 ans)',
    missions: 'Le conseil régional gère les lycées, le développement économique régional, les transports (TER) et la formation professionnelle.',
  },
  {
    date: 'Mai – juin 2029 (date exacte non déclarée)',
    statut: 'Fenêtre prévue — dates non encore fixées par décret',
    titre: 'Élections européennes',
    lieu: 'Union européenne (France)',
    emoji: '🇪🇺',
    quiVote: 'Les citoyens français et les ressortissants de l\'Union européenne résidant en France, inscrits sur les listes',
    quiElit: 'Les députés européens français au Parlement européen (81 sièges, pour 5 ans)',
    missions: 'Le Parlement européen vote les directives et règlements européens (environnement, marché unique, numérique), adopte le budget de l\'Union et élit la Commission.',
  },
  {
    date: 'Mars 2031 (date exacte non déclarée)',
    statut: 'Fenêtre prévue — dates non encore fixées par décret',
    titre: 'Élections départementales',
    lieu: 'France',
    emoji: '🛤️',
    quiVote: 'Les électeurs inscrits dans chaque canton',
    quiElit: 'Les conseillers départementaux (pour 6 ans)',
    missions: 'Mêmes missions que les cantonales : le conseil départemental gère les collèges, la solidarité (RSA, enfance) et les routes départementales.',
  },
  {
    date: 'Juin – juillet 2032 (date exacte non déclarée)',
    statut: 'Fenêtre prévue — dates non encore fixées par décret',
    titre: 'Élections législatives',
    lieu: 'France',
    emoji: '⚖️',
    quiVote: 'Les électeurs inscrits dans chaque circonscription législative',
    quiElit: 'Les 577 députés de l\'Assemblée nationale (pour 5 ans)',
    missions: 'Les députés votent les lois, contrôlent le gouvernement et peuvent le renverser par une motion de censure. Ils sont élus au scrutin majoritaire à deux tours.',
  },
]

export default function Calendrier() {
  return (
    <section className="calendrier-page">
      <div className="bloc">
        <h2>📅 Le calendrier des élections</h2>
        <p>
          Toutes les élections à venir en France et en Europe, avec le rôle de chaque scrutin : qui vote, qui l'on
          élit, pour quelles missions. <strong>Les dates exactes des scrutins sont fixées par décret en début d'année
          électorale</strong> — elles ne sont pas encore disponibles ; seule la fenêtre prévue par le code électoral
          est indiquée.
        </p>
      </div>
      {ELECTIONS.map((e) => (
        <div key={e.titre} className="carte-election">
          <div className="entete-election">
            <span className="emoji-election">{e.emoji}</span>
            <div>
              <h3>{e.titre}</h3>
              <p className="meta-election">📍 {e.lieu} · 🗓️ {e.date}</p>
              <p className="statut-election">ℹ️ {e.statut}</p>
            </div>
          </div>
          <p><strong>Qui vote :</strong> {e.quiVote}</p>
          <p><strong>Qui on élit :</strong> {e.quiElit}</p>
          <p><strong>Pour quelles missions :</strong> {e.missions}</p>
        </div>
      ))}
    </section>
  )
}
