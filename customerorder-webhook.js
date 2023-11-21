const $api = require('../server/http/index');

const customerOrderWebhook = async () => {
    const url = "https://api.moysklad.ru/api/remap/1.2/entity/webhook";
    const res = await $api.post(url, {
        action: "UPDATE",
        entityType: "customerorder"
    });
    console.log(res);
}

customerOrderWebhook();

// one time