var router = new FrontRouter();

router.route('blue', function() {
	document.body.style.backgroundColor = 'blue';
})
router.route('yellow', function() {
	document.body.style.backgroundColor = 'yellow';
})
router.route('red', function() {
	document.body.style.backgroundColor = 'red';
})


router.route('address', function() {
	document.getElementById('index').style.display = 'none';
	document.getElementById('address').style.display = 'block';
})