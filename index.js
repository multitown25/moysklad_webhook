const express = require('express');
const axios = require('axios');
const app = express();

const tokenMS = 'c74a8a50dd71f2effeeb0760ca923825bffb5d6b';
const pathsMasla = ['Каталог/Масла', 'Каталог/Парфюм-масла'];
const razlivState = {
    state: {
        meta: {
            href: "https://api.moysklad.ru/api/remap/1.2/entity/customerorder/metadata/states/2b3967e8-8474-11ee-0a80-07930027acd1",
            type: "state",
            mediaType: "application/json"
        }
    }
}

const $api = axios.create({
    withCredentials: true
});

$api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${tokenMS}`;
    return config;
});


app.use(express.urlencoded({extended: true}))
app.use(express.json());


app.post('/webhook-customerorder-send-to-masla', async (req, res, next) => {
    try {
        const orderId = req.query.id;
        console.log(orderId);
        const orderHref = `https://api.moysklad.ru/api/remap/1.2/entity/customerorder/${orderId}`
        const fetchItem = await $api.get(orderHref + '?expand=positions.assortment').then(data => data.data.positions.rows);
        // console.log(fetchItem);
        const masla = fetchItem.filter(item => pathsMasla.some(pathItem => item.assortment.pathName?.startsWith(pathItem)));
        // console.log(masla);
        if (masla.length !== 0) {
            console.log(`${orderId} has masla`);
            // console.log(masla);
            // check previous state
            const url = `https://api.moysklad.ru/api/remap/1.2/entity/customerorder/${orderId}/audit`;
            const auditRes = await $api.get(url).then(data => data.data.rows);
            const stateChanged = auditRes.find(item => item.diff?.state?.oldValue?.name === 'РАЗЛИВ МАСЕЛ');

            if (!stateChanged) {
                const changeStatusPUT = await $api.put(orderHref, razlivState).then(data => {
                                return {
                                    status: data.status,
                                    method: data.config.method,
                                    data: data.data
                                }
                            });
                            console.log('RESPONSE STATUS: ', changeStatusPUT.status);
            } else {
                console.log('STATE WAS CHANGED', stateChanged.name);
            }
        } else {
            console.log('PUSTO');
            console.log(masla);
        }
        // console.log(fetch.state);
        res.status(200);
        res.end();
    } catch (error) {
        console.log(error);
    }
});

// async function predzakazAutoStore(fetch) {
//         try {
//                 if (fetch.diff?.state?.newValue?.name === "ПРЕДЗАКАЗ С РФ" || fetch.diff?.state?.newValue?.name === "ПРЕДЗАКАЗ С КИТАЯ") {
//                         const orderHref = fetch.entity.meta.href;
// 			console.log("ORDERHREF FROM PREDZAKAZ");
//                         console.log(orderHref);
//                         const changeStoreRes = await $api.put(orderHref, {
//                                 store: {
//                                         meta: {
//                                                 href: "https://api.moysklad.ru/api/remap/1.2/entity/store/cb6618bb-448e-11ec-0a80-0dea0020abed",
//                                                 metadataHref: "https://api.moysklad.ru/api/remap/1.2/entity/store/metadata",
//                                                 type: "store",
//                                                 mediaType: "application/json"
//                                         }
//                                 }
//                         }).then(data => {
//                                 return {
//                                         status: data.status,
//                                         method: data.config.method,
//                                         data: data.data
//                                 }
//                         });
//                 }
//         } catch (error) {
//                 console.log(error);
//         }
// }

app.listen(7000);

function checkOrderForMasla() {
    const url = 'https://api.moysklad.ru/api/remap/1.2/entity/customerorder?filter=state.name=TEST STATUS';


}



