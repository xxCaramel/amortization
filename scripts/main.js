document.getElementById("amort_button").addEventListener("click", () => {
    
    erase_element("amort_table");
    erase_element("stats_table");
    
    const form = new FormData(document.getElementById("amort_form"));
    const params = get_calc_input(form);

    headers = {
        schedule: ["Período", "Intereses", "Abono", "Saldo a obligación"],
        stats: ["Pago Mensual", "Intereses Totales", "Pago Total"]
    }

    amortization_schedule(params, headers, "amort_table","stats_table");

});

/** Converts a text to int else returns 0
 * @param {string} string - string to convert to number 
 */
function to_int(string){

    const number = parseInt(string);
    if(number)
        return number;
    else
        return 0;

}

function get_calc_input(form){


    const years = to_int(form.get("term_years"));
    const months = to_int(form.get("term_months"));
    const weeks = to_int(form.get("term_weeks"));

    const loan_term = years + (months/12) + (weeks/52);
    console.log("Loan term:", loan_term);

    const form_values = {
        loan: Math.abs(form.get("total_loan")),
        periods: loan_term,
        interests: Math.abs(form.get("annual_interests")),
        compounded: form.get("compounded")
    }

    return form_values;
}

/** Erases an element with id if it exists
 * @param {string} id - id of the element to erase
*/
function erase_element(id) {
    
    table = document.getElementById(id);
    if(table !== null)
        table.remove();
}


/** Creates an html table an populates it with data
 * @param {Array} headers  - headers of the table
 * @param {Object[]} data     - array of objects to populate the table
 * @param {string} id      - id to assign to the new table
 * 
*/
function create_table(headers, data, id) {

    const table = document.createElement("table");
    
    let thead = table.createTHead()
    let hrow = thead.insertRow(0)
    headers.forEach((hname) => {
        let hcell = document.createElement("th");
        hcell.innerHTML = hname;
        hrow.appendChild(hcell);
    
    });
    
    data.forEach((cell, cell_index) => {
        let row = table.insertRow(cell_index + 1);
        Object.values(cell).forEach((value, value_index) => {
            data_cell = row.insertCell(value_index);
            data_cell.innerHTML = value;
        });
    
    });
    
    table.id = id;
    return table;

}

function amortization_schedule(form, headers, table_id, stats_id) {

    const term = form.periods * compounded_factor(form.compounded);
    const interests = form.interests/(100*compounded_factor(form.compounded));

    const mp = payments(form.loan, form.periods, form.interests, form.compounded);
    const data = amortization_data(form.loan, term, interests, mp);

    const total_interests = data.reduce((sum, cell) => {
        return sum + cell.interest}, 0);
    const total_payment = data.reduce((sum, cell) => {
        return sum + cell.interest + cell.principal}, 0);
        
    const stats_data = [{
        mp: Math.round(mp * 100) / 100,
        total_interests: Math.round(total_interests * 100) / 100,
        total_payment: Math.round(total_payment * 100) / 100,
    }];
    
   
    
    schedule = create_table(headers.schedule, data, table_id);
    stats = create_table(headers.stats, stats_data, stats_id);
    
    const amort_div = document.getElementById("amort_div");
    amort_div.appendChild(stats);
    amort_div.appendChild(schedule);

}

function amortization_data(loan, periods, interest, mp) {
    
    let data = [];
    let beginning_balance = loan;
    let interest_to_pay = 0;
    let principal = 0;
    let ending_balance = loan;

    for (let i = 0; i <= periods; i++) {
    
        let data_point = create_data_point(i, interest_to_pay, principal, ending_balance);
        data.push(data_point);
    
        interest_to_pay = (interest * beginning_balance);
        principal = (mp - interest_to_pay);
        ending_balance = (beginning_balance - principal);
        beginning_balance = ending_balance;
    
    }
    return data;
}

function create_data_point(period, interest, principal, ending_balance) {

    return {
        period: Math.round(period * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        principal:Math.round(principal * 100) / 100,
        ending_balance: Math.round(ending_balance * 100) / 100
    }

}

function compounded_factor(compounded) {
    switch (compounded) {
        case "annual":
            return 1;
        case "biannualy":
            return 2;    
        case "quarterly":
            return 3;
        case "trimester":
            return 4;
        case "month":
            return 12;   
        case "weekly":
            return 52;

    }
}

function payments(principal, term, interests, compounded) {
    
    let factor = compounded_factor(compounded);
 
    const P = principal;
    const i = interests/(100*factor);
    const n = factor*term;

    const A = P * ((i*(1+i)**n)/(((1+i)**n) - 1));
    
    return A
}






