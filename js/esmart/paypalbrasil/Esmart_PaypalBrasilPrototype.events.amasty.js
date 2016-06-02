

    EsmartPaypalBrasilBtnContinue.setElement('#amscheckout-submit', '.order-review-button', true);

    $$("input[type=radio][name='payment[method]']").each( function(el) {
        el.observe('change', function(el){
            el.preventDefault();
            if (this.value == 'paypal_plus') {
                //$jPPPlus('#ppplus').removeAttr('style').html('');
                if (!EsmartPaypalBrasilPPPlus.requestPending) {                    
                    setTimeout(function () {
                        EsmartPaypalBrasilPPPlus.generateUrl();
                    }, 500);
                }
            } else {
                EsmartPaypalBrasilBtnContinue.enable();
            }
         })
    });
    
    $$("input[type=radio][name='payment[method]']").each(function(el){ el.checked = false});

    EsmartPaypalBrasilPPPlus.init();

