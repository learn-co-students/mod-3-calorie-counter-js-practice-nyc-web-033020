const _HEADERS = {
	"Content-Type": "application/json",
	"Accept": "application/json"
}

const totalCalories = entries => {

	const total = entries.reduce((acc,cur) => {
		return acc + cur.calorie;
	}, 0);

	document.querySelector('progress').value = total;

	return total;
}

const getEntries = () => {
	fetch("http://localhost:3000/api/v1/calorie_entries")
	.then( res => res.json() )
	.then( entries => populateCaloriesList(entries) )
}

const populateCaloriesList = caloriesListEntries=> {	
	const caloriesList = document.getElementById('calories-list');
	caloriesList.innerHTML = ``;
	caloriesListEntries.forEach(entry => {
		totalCalories(caloriesListEntries);
		const caloriesListItem = createCaloriesListItem(entry);	
		caloriesList.appendChild(caloriesListItem);
	});
};

const createCaloriesListItem = entry => {
	
	const caloriesListItem = document.createElement('li');
	
	caloriesListItem.className = 'calories-list-item'
	caloriesListItem.setAttribute('itemId', entry.id)
	caloriesListItem.innerHTML = `
		<div class="uk-grid"> 
			<div class="uk-width-1-6"> 
				<strong>${entry.calorie}</strong> 
				<span>kcal</span> </div> <div class="uk-width-4-5"> 
				<em class="uk-text-meta">${entry.note}</em>
			</div>
		</div>
		<div class="list-item-menu"><a class="edit-button" 
				uk-toggle="target: #edit-form-container" 
				uk-icon="icon: pencil">
			</a><a class="delete-button" 
				uk-icon="icon: trash">
			</a></div>`;

	const deleteButton = caloriesListItem.querySelector("div > a.delete-button");
	const editButton = caloriesListItem.querySelector("div > a.edit-button");

	deleteButton.addEventListener('click', () => deleteEntry(entry));
	editButton.addEventListener('click', () => editEntry(entry));

	return caloriesListItem;
};

const deleteEntry = entry => {
	const url = `http://localhost:3000/api/v1/calorie_entries/${entry.id}`;
	const data = {
		headers: _HEADERS,
		method: 'DELETE',
	};
	fetch(url, data)
	.then( res => res.json() )
	.then( deletedItem => {
		getEntries();
	})
};

const newEntry = entry => {
	const data = {
		headers: _HEADERS,
		method: "POST",
		body: JSON.stringify(entry) 
	};
	const url = "http://localhost:3000/api/v1/calorie_entries";
	fetch(url, data)
	.then( res => res.json() )
	.then( entry => {
		getEntries();
	});
}

const editEntry = entry => {
	const editCalorieForm = document.getElementById('edit-calorie-form');
	editCalorieForm.calorie.value = entry.calorie;
	editCalorieForm.note.value = entry.note

	editCalorieForm.addEventListener('submit', e => {
		e.preventDefault();
		const data = {
			headers: _HEADERS,
			method: "PATCH",
			body: JSON.stringify({
				calorie: editCalorieForm.calorie.value,
				note: editCalorieForm.note.value
			})
	
		};
		const url = `http://localhost:3000/api/v1/calorie_entries/${entry.id}`;
		
		fetch(url,data)
		.then( res => res.json() )
		.then( json => {
			getEntries(); 
			document.getElementById('edit-form-container').style.display='none'
		})
	});
};

// BMR Calcilator
const bmrCalc = (weight,height,age) => {
	const lower = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age);
	const upper = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age);
	return { lower: lower, upper: upper };
};

const getBMR = () => {
	const bmrForm = document.getElementById('bmr-calculator');
	
	const weight = bmrForm.weight.value;
	const height = bmrForm.height.value;
	const age = bmrForm.age.value;
	
	const bmr = bmrCalc(weight,height, age);
	displayBMR(bmr);
}

const displayBMR = bmr => {
	const highRangeDisplay = document.getElementById('higher-bmr-range');
	const lowRangeDisplay = document.getElementById('lower-bmr-range');

	highRangeDisplay.textContent = Math.round(bmr.upper);
	lowRangeDisplay.textContent = Math.round(bmr.lower);

	const progressBar = document.querySelector("progress");
	progressBar.max = Math.round((bmr.upper + bmr.lower)/2);
}

document.addEventListener("DOMContentLoaded", () => {
	getEntries()
	
	// Listeners 
	const calculateBmrForm = document.getElementById('bmr-calculator')
	calculateBmrForm.addEventListener('submit', e => {
		e.preventDefault();
		getBMR();	
	});

	const newCalorieForm = document.getElementById('new-calorie-form');
	newCalorieForm.addEventListener('submit', e => {
		e.preventDefault();
		const entry = {
			calorie: Number(newCalorieForm.calorie.value),
			note: newCalorieForm.note.value
		};
		newEntry(entry);
	});
});
