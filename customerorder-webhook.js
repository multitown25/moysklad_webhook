const $api = require('../../backend/http/index');

const customerOrderWebhook = async () => {
    const url = "https://api.moysklad.ru/api/remap/1.2/entity/webhook";
    const res = await $api.post(url, {
	url: "https://94.180.255.226:7000/customerorder-webhook",
        action: "UPDATE",
        entityType: "customerorder"
    });
    console.log(res);
}

customerOrderWebhook();

// one time
