import React from 'react'

// Élections à venir en France et en Europe, avec le rôle de chaque scrutin.
// Dates : réelles et sourcées quand elles sont fixées officiellement,
// sinon fourchette (mention « date non définitive ») ou « date non déclarée ».
const ELECTIONS = [
  {
    date: 'Dimanche 18 avril 2027 (1er tour) et dimanche 2 mai 2027 (2e tour)',
    typeDate: 'exacte',
    source: { titre: 'service-public.gouv.fr — dates des prochaines élections', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1939' },
    titre: 'Élection présidentielle',
    lieu: 'France',
    emoji: '🗳️',
    quiVote: 'Les électeurs inscrits sur les listes électorales (18 ans révolus, nationalité française)',
    quiElit: 'Le président de la République pour 5 ans',
    missions: 'Le président nomme le Premier ministre, promulgue les lois, est chef des armées et garant du fonctionnement des institutions. Élu au suffrage universel direct, avec second tour entre les deux candidats arrivés en tête.',
  },
  {
    date: 'Juin 2027 (dans les 60 jours suivant l\'élection présidentielle)',
    typeDate: 'fourchette',
    titre: 'Élections législatives',
    lieu: 'France',
    emoji: '⚖️',
    quiVote: 'Les électeurs inscrits dans chaque circonscription législative',
    quiElit: 'Les 577 députés de l\'Assemblée nationale (pour 5 ans)',
    missions: 'Les députés votent les lois, contrôlent le gouvernement et peuvent le renverser par une motion de censure. Ils sont élus au scrutin majoritaire à deux tours.',
  },
  {
    date: 'Mars 2028',
    typeDate: 'fourchette',
    titre: 'Élections départementales (cantonales)',
    lieu: 'France',
    emoji: '🛤️',
    quiVote: 'Les électeurs inscrits dans chaque canton (circonscription électorale du département)',
    quiElit: 'Les conseillers départementaux (pour 6 ans, binômes femme-homme par canton)',
    missions: 'Le conseil départemental gère les collèges, les routes départementales, l\'action sociale (RSA, protection de l\'enfance) et les transports scolaires.',
  },
  {
    date: 'Mars 2028',
    typeDate: 'fourchette',
    titre: 'Élections régionales',
    lieu: 'France',
    emoji: '🏞️',
    quiVote: 'Les électeurs inscrits dans chaque région',
    quiElit: 'Les conseillers régionaux (pour 6 ans)',
    missions: 'Le conseil régional gère les lycées, le développement économique régional, les transports (TER) et la formation professionnelle.',
  },
  {
    date: 'Mai – juin 2029',
    typeDate: 'fourchette',
    titre: 'Élections européennes',
    lieu: 'Union européenne (France)',
    emoji: '🇪🇺',
    quiVote: 'Les citoyens français et les ressortissants de l\'Union européenne résidant en France, inscrits sur les listes',
    quiElit: 'Les députés européens français au Parlement européen (81 sièges, pour 5 ans)',
    missions: 'Le Parlement européen vote les directives et règlements européens (environnement, marché unique, numérique), adopte le budget de l\'Union et élit la Commission.',
  },
  {
    date: 'Septembre 2029',
    typeDate: 'fourchette',
    titre: 'Élections sénatoriales (série 1)',
    lieu: 'France',
    emoji: '🏛️',
    quiVote: 'Les grands électeurs : députés, conseillers départementaux, régionaux, municipaux et sénateurs sortants. Les citoyens n\'y votent pas directement.',
    quiElit: 'La moitié du Sénat (série 1, 170 sénateurs)',
    missions: 'Les sénateurs votent la loi au même titre que l\'Assemblée nationale, représentent les collectivités territoriales et contrôlent le gouvernement. Le Sénat est renouvelé par moitié tous les trois ans.',
  },
  {
    date: 'Mars 2032',
    typeDate: 'fourchette',
    titre: 'Élections municipales',
    lieu: 'France',
    emoji: '🏙️',
    quiVote: 'Les électeurs inscrits dans chaque commune, y compris les ressortissants de l\'Union européenne pour les listes municipales (sauf maire et adjoints)',
    quiElit: 'Les conseils municipaux (pour 6 ans)',
    missions: 'Le conseil municipal élit le maire. La commune gère : état civil, écoles primaires, urbanisme, action sociale de proximité, police municipale.',
  },
]

const MENTIONS = {
  exacte: null,
  fourchette: '📅 Date non définitive : fenêtre prévue par le code électoral, le jour exact sera fixé par décret',
  declaree: '📅 Date non déclarée',
}

export default function Calendrier() {
  return (
    <section className="calendrier-page">
      <div className="bloc">
        <h2>📅 Le calendrier des élections</h2>
        <p>
          Toutes les élections à venir en France et en Europe, avec le rôle de chaque scrutin : qui vote, qui l'on
          élit, pour quelles missions. Quand la date est officiellement fixée, elle est indiquée avec sa source ;
          sinon une fourchette est donnée avec la mention <strong>« date non définitive »</strong>, ou{' '}
          <strong>« date non déclarée »</strong> si aucune information n'est disponible.
        </p>
      </div>
      {ELECTIONS.map((e) => (
        <div key={e.titre} className="carte-election">
          <div className="entete-election">
            <span className="emoji-election">{e.emoji}</span>
            <div>
              <h3>{e.titre}</h3>
              <p className="meta-election">📍 {e.lieu} · 🗓️ {e.date}</p>
              {MENTIONS[e.typeDate] && <p className="statut-election">{MENTIONS[e.typeDate]}</p>}
              {e.source && (
                <p className="statut-election">
                  ✅ Date officielle — <a href={e.source.url} target="_blank" rel="noreferrer">{e.source.titre} ↗</a>
                </p>
              )}
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
