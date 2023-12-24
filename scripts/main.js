document.getElementById("amort_button").addEventListener("click", () => {
    
    erase_table("amort_table");
    
    const form = new FormData(document.getElementById("amort_form"));
    
    let form_values = {
        loan: form.get("total_loan"),
        periods: form.get("loan_term"),
        interests: form.get("annual_interests")
    
    }
    
    amortization_schedule(form_values,"amort_table");


});

function erase_table(id) {
    
    table = document.getElementById(id);
    if(table !== null)
        table.remove();

}

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

function amortization_schedule(form, table_id) {


    const mp = monthly_payments(form.loan, form.periods, form.interests);
    const data = amortization_data(form.loan, form.periods, form.interests/1200, mp);
    
    
    headers = ["Mes", "Intereses", "Abono", "Saldo a obligación"];
    table = create_table(headers, data, table_id);
    
    const amort_div = document.getElementById("amort_div");
    amort_div.appendChild(table);
    
    console.log(mp.toFixed(2))
    console.log(form.interests/1200);
    
    

}

function amortization_data(loan, periods, monthly_interest, mp) {
    
    let data = [];
    let beginning_balance = loan;

    for (let i = 1; i <= periods; i++) {
    
        let interest_to_pay = (monthly_interest * beginning_balance);
        let principal = (mp - interest_to_pay);
        let ending_balance = (beginning_balance - principal);
        
        let data_point = create_data_point(i, interest_to_pay, principal, ending_balance);
        data.push(data_point);
        
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

function monthly_payments(principal, term, interests) {
    
    const P = principal;
    const i = interests/1200
    const n = term;
    
    const A = P * ((i*(1+i)**n)/(((1+i)**n) - 1));
    
    return A
}






