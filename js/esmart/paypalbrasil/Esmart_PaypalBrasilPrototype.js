var EsmartPaypalBrasilPPPlus, EsmartPaypalBrasilBtnContinue;

if (typeof EsmartPaypalBrasilPPPlus !== 'object') {
	EsmartPaypalBrasilPPPlus = {
		ppp             : null,
        base_url        : null,

        generateUrl : function () {
            $$("div#paypal_plus_loading").invoke('show');
            $('paypal_plus_iframe').update('').removeAttribute('style');
            
            var url = this.base_url + 'paypalbrasil/express/generateUrl';

            new Ajax.Request(url ,{
                    method: 'post',
                    parameters: $("payment_form_paypal_plus").up('form').serialize(true),
                    async: true,
                    onSuccess: function (response) {

                    var responseContent = response.responseText.evalJSON();

                    if (typeof responseContent.error !== 'undefined') {
                        if (responseContent.error == 'incomplete_customer') {
                            EsmartPaypalBrasilPPPlus.showAlert();
                        }

                        $$("div#paypal_plus_loading")[0].hide();
                        $$("input[type=radio][name='payment[method]']").each(function(el){ el.checked = false});
                        return false;
                    }

                    if (responseContent.success.approvalUrl === null) {
                        $$("div#paypal_plus_loading")[0].hide();
                        EsmartPaypalBrasilPPPlus.showAlert();
                        $$("input[type=radio][name='payment[method]']").each(function(el){ el.checked = false});
                        return false;
                    }

                    if (typeof responseContent.success !== 'undefined') {
                        EsmartPaypalBrasilPPPlus.ppp = PAYPAL.apps.PPP({
                            placeholder        : "paypal_plus_iframe",
                            buttonLocation     : "outside",
                            enableContinue     : function () {
                                EsmartPaypalBrasilBtnContinue.enable();
                            },
                            disableContinue    : function () {
                                EsmartPaypalBrasilBtnContinue.disable();
                            },
                            language           : "pt_BR",
                            country            : "BR",
                            approvalUrl        : responseContent.success.approvalUrl,
                            mode               : responseContent.success.mode,
                            payerFirstName     : responseContent.success.payerFirstName,
                            payerLastName      : responseContent.success.payerLastName,
                            payerEmail         : responseContent.success.payerEmail,
                            payerTaxId         : responseContent.success.payerTaxId,
                            payerTaxIdType     : responseContent.success.payerTaxIdType,
                            rememberedCards    : responseContent.success.rememberedCards
                        });

                        $$("div#paypal_plus_loading")[0].hide();
                        return true;
                    }
                }
                });
        },

        init : function () {
            if (window.addEventListener) {
                window.removeEventListener('message', esmartPaypalBrasilHandler);
                window.addEventListener('message', esmartPaypalBrasilHandler, false);
                return true;
            }

            if (window.attachEvent) {
                window.detachEvent("message", esmartPaypalBrasilHandler);
                window.attachEvent("message", esmartPaypalBrasilHandler);
                return true;
            }

            return false;
        },

        handler : function (event) {

            var data = event.data.evalJSON();

            switch (data.action) {

                case 'checkout':
                    var dataPost = {
                        rememberedCards : data.result.rememberedCards,
                        payerId         : data.result.payer.payer_info.payer_id,
                        payerStatus     : data.result.payer.status,
                        checkoutId      : data.result.id,
                        checkoutState   : data.result. state,
                        cards           : []
                    };

                    if (undefined != data.result.payer.funding_option) {
                        for (key in data.result.payer.funding_option.funding_sources) {
                            if (Number(key) == key) {
                                var cardData = {
                                    termQty     : 1,
                                    termValue   : data.result.payer.funding_option.funding_sources[key].amount.value,
                                    total       : data.result.payer.funding_option.funding_sources[key].amount.value
                                };

                                if (typeof data.result.term !== 'undefined') {
                                    cardData.termQty    = data.result.term.term;
                                    cardData.termValue  = data.result.term.monthly_payment.value;
                                }

                                dataPost.cards.push(cardData);
                            }
                        }
                    }

                    var url = this.base_url + 'paypalbrasil/express/savePaypalInformation';
                    new Ajax.Request(url,{
                        method: 'post',
                        parameters  : dataPost,
                        async       : false,
                        onSuccess : function (response) {
                            setTimeout(function() { EsmartPaypalBrasilBtnContinue.executeOriginalEvents(); }, 2000);
                        }
                    });

                    break;
            }
        },

        showAlert : function() {
            alert("Prezado cliente, favor preencher os dados dos passos anteriores antes de selecionar a Forma de Pagamento.");
        }
    };
}

if (typeof EsmartPaypalBrasilBtnContinue !== 'object') {
	 EsmartPaypalBrasilBtnContinue = {
	 	 element: null,
        originalElement: null,

        disable: function () {
            this.element.writeAttribute('disabled');
        },

        enable: function () {
            this.element.removeAttribute("disabled");
        },

        executeOriginalEvents: function () {
            $$('#original-btn-submit').invoke('click');
        },

        setElement: function (originalBtnElement, appendTo, removeEvents) {
            if (typeof removeEvents === 'undefined') {
                removeEvents = false;
            }

            if ($$('#original-btn-submit').size() === 0) {
                var BtnClone = $$(originalBtnElement)[0].clone(true).writeAttribute('id', 'esmart-paypalbrasil-btn-submit');
                $$(appendTo)[0].insert(BtnClone);

                this.element = $('esmart-paypalbrasil-btn-submit');
                //$$(originalBtnElement)[0].hide();
                $$(originalBtnElement)[0].writeAttribute('id', 'original-btn-submit').hide();

                if (removeEvents) {
                    this.element.removeAttribute('onclick');
                }

                this.element.observe('click',function (e) {
                    if (typeof e === 'undefined') {
                        return;
                    }

                    e.preventDefault();

                    if ($$("input[type=radio][name='payment[method]']:checked")[0].getValue() === 'paypal_plus') {
                        EsmartPaypalBrasilPPPlus.ppp.doContinue();
                    } else {
                        EsmartPaypalBrasilBtnContinue.executeOriginalEvents();
                    }
                });
            }
        }
	 };
}

function esmartPaypalBrasilHandler(event) {
    EsmartPaypalBrasilPPPlus.handler(event);
}
