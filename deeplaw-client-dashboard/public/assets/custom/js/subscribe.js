$(document).ready(function() {
	var subscriptionType = 'IllinoisMonthlyStartup';

	$('#illinois .cd-pricing-footer .cd-select').click(function() {
		$('#trademark li').removeClass('cd-popular');
		subscriptionType = $(this).attr('id');
	});

	$('#trademark .cd-pricing-footer .cd-select').click(function() {
		$('#illinois li').removeClass('cd-popular');
		subscriptionType = $(this).attr('id');
	});

	// Create a Stripe client.
	var stripe = Stripe('pk_test_feoFyzJjxnuwplzuHSuK52MF00gkFEspJ2');

	// Create an instance of Elements.
	var elements = stripe.elements();

	// Custom styling can be passed to options when creating an Element.
	// (Note that this demo uses a wider set of styles than the guide below.)
	var style = {
	  base: {
	    color: '#32325d',
	    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
	    fontSmoothing: 'antialiased',
	    fontSize: '16px',
	    '::placeholder': {
	      color: '#aab7c4'
	    }
	  },
	  invalid: {
	    color: '#fa755a',
	    iconColor: '#fa755a'
	  }
	};

	// Create an instance of the card Element.
	var card = elements.create('card', {style: style});

	// Add an instance of the card Element into the `card-element` <div>.
	card.mount('#card-element');

	// Handle real-time validation errors from the card Element.
	card.addEventListener('change', function(event) {
	  var displayError = document.getElementById('card-errors');
	  if (event.error) {
	    displayError.textContent = event.error.message;
	  } else {
	    displayError.textContent = '';
	  }
	});

	// Handle form submission.
	var form = document.getElementById('payment-form');
	form.addEventListener('submit', function(event) {
	  event.preventDefault();

	  stripe.createToken(card).then(function(result) {
	    if (result.error) {
	      // Inform the user if there was an error.
	      var errorElement = document.getElementById('card-errors');
	      errorElement.textContent = result.error.message;
	      toastr.warning(errorElement.textContent);
	    } else {
	      // Send the token to your server.
	      stripeTokenHandler(result.token);
	    }
	  });
	});

	// Submit the form with the token ID.
	function stripeTokenHandler(token) {
	  // Insert the token ID into the form so it gets submitted to the server
	  var email = $('#email').val();
	  var fullname = $('#fullname').val();
	  var password = $('#password').val();
	  if (email == undefined || email == "" || !email.includes("@")) {
	  	toastr.warning('Please input valid information');
	  	return;
	  }
	  if (fullname == undefined || fullname == "") {
	  	toastr.warning('Please input valid information');
	  	return;
	  }
	  if (password == undefined || password == "") {
	  	toastr.warning('Please input valid information');
	  	return;
	  }

	  var content = {
	  	"email": email,
	  	"password": password,
	  	"fullname": fullname,
	  	"stripeToken": token.id,
	  	"subType": subscriptionType
	  }

	  axios.post("/auth/charge", {
		  content: content
		})
		.then((res) => {
			var result = res['data'];
			if (result['message'] == "Error") {
				toastr.error(result['error']);
				return;
			}
	    localStorage.setItem("token", result['token']);
      localStorage.setItem("username", result['userId']);
      window.location.href = "/chat";
		})
		.catch((res) => {
			console.log(res);
		  console.log("Sorry. Server unavailable. ");
		}); 
	}

});
