import { mettreAJourScrutins } from '../server/scrutins.mjs'

mettreAJourScrutins()
  .then((r) => console.log(`✅ ${r.scrutins} scrutins consolidés (${r.majLe})`))
  .catch((e) => {
    console.error('❌ Échec de la mise à jour des scrutins :', e.message)
    process.exit(1)
  })
