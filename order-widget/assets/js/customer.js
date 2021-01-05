Spreedly.init("OIaI5M4wUbnISGYMxuyaCXIdRu7", {
  "numberEl": "spreedly-number-test",
  "cvvEl": "spreedly-cvv-test"
});

Spreedly.on('paymentMethod', function(token, pmData) {
  var tokenField = document.getElementById("payment_method_token");
  tokenField.setAttribute("value", token);
  localStorage.setItem('payment_method_token', token);
  localStorage.setItem('paymentMethod', 'CARD');
  var masterForm = document.getElementById('payment-form');

  // Normally would now submit the form..
  masterForm.submit();
});

Spreedly.on('errors', function(errors) {
  var messageEl = document.getElementById('errors');
  var errorBorder = "1px solid red";
  for(var i = 0; i < errors.length; i++) {
    var error = errors[i];
    if(error["attribute"]) {
      var masterFormElement = document.getElementById(error["attribute"]);
      if(masterFormElement) {
        masterFormElement.style.border = errorBorder
      } else {
        Spreedly.setStyle(error["attribute"], "border: " + errorBorder + ";");
      }
    }
    messageEl.innerHTML += error["message"] + "<br/>";
  }
});

Spreedly.on('ready', function(frame) {
  Spreedly.setFieldType('number', 'text');
  Spreedly.setFieldType('cvv', 'text');
  Spreedly.setNumberFormat('maskedFormat');
});

Spreedly.on('fieldEvent', function(name, event, activeElement, inputData) {
  if (event == 'input') {
    if (inputData["validCvv"]){
      Spreedly.setStyle('cvv', "background-color: #CDFFE6;")
    } else {
      Spreedly.setStyle('cvv', "background-color: #FFFFFF;")
    }
    if (inputData["validNumber"]){
      Spreedly.setStyle('number', "background-color: #CDFFE6;")
    } else {
      Spreedly.setStyle('number', "background-color: #FFFFFF;")
    }
  }
});

function submitPaymentForm() {
  var normalBorder = "1px solid #ccc";

  // These are the fields whose values we want to transfer *from* the
  // master form *to* the payment frame form. Add the following if
  // you're displaying the address:
  // ['address1', 'address2', 'city', 'state', 'zip', 'country']
  var paymentMethodFields = ['full_name', 'month', 'year']
  options = {};
  for(var i = 0; i < paymentMethodFields.length; i++) {
    var field = paymentMethodFields[i];

    // Reset existing styles (to clear previous errors)
    var fieldEl = document.getElementById(field);
    fieldEl.style.border = normalBorder;

    // add value to options
    options[field]  = fieldEl.value
  }

  // Reset frame styles
  Spreedly.setStyle('number', "border: " + normalBorder + ";");
  Spreedly.setStyle('cvv', "border: " + normalBorder + ";");

  // Tokenize!
  Spreedly.tokenizeCreditCard(options);
}

