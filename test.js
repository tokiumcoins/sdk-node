const Tokium = require('./index.js');

let profile = new Tokium.Profile();
/*
tokiumEvents.on('wallets-changed', profile => {
    console.info(JSON.stringify(profile, null, 2));
})

tokiumEvents.on('waiting-transactions-changed', transactions => {
    console.info(JSON.stringify(transactions, null, 2));
})
*/

profile.login('jorgepruden@gmail.com', '123456').then(() => {
    console.info(profile);

    Tokium.Tools.getAssetsList().then(assets => {
        console.info(assets);
    })
});
