const BASE_URL = "https://contact-s5ve.onrender.com" // ✅ URL complète
const tableBody = document.getElementById("contactTableBody")
let editId = null

function getToken(){
    return sessionStorage.getItem("token") // ✅ sessionStorage
}

function checkAuth(){
    if(!getToken()){
        window.location.href = "/login.html"
    }
}

function authHeaders(){
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    }
}

document.addEventListener('DOMContentLoaded', function(){
    checkAuth()

    const form = document.getElementById("contactForm")
    const searchInput = document.getElementById("searchInput")

    document.getElementById("logoutBtn")?.addEventListener("click", function(){
        sessionStorage.removeItem("token") // ✅ sessionStorage
        window.location.href = "/login.html"
    })

    searchInput.addEventListener("input", function(){
        loadContact(this.value)
    })

    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        const data = {
            nom: document.getElementById("nom").value,
            prenom: document.getElementById("prenom").value,
            email: document.getElementById("email").value,
        }

        let reponse;

        if(editId){
            reponse = await fetch(`${BASE_URL}/api/contacts/${editId}`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify(data)
            })
            editId = null
        } else {
            reponse = await fetch(`${BASE_URL}/api/contacts`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(data)
            })
        }

        const resultat = await reponse.json()

        if(reponse.status === 401){
            window.location.href = "/login.html"
            return
        }

        if(!reponse.ok){
            document.getElementById("errorMessage").textContent = resultat.error
            return
        }

        document.getElementById("errorMessage").textContent = ""
        form.reset()
        loadContact()
    })

    loadContact()
})


async function loadContact(search = ""){
    const res = await fetch(`${BASE_URL}/api/contacts?search=${search}`, {
        headers: authHeaders()
    })

    if(res.status === 401){
        window.location.href = "/login.html"
        return
    }

    const contacts = await res.json()
    tableBody.innerHTML = ""

    contacts.forEach(contact => {
        const row = document.createElement("tr")
        row.innerHTML = `
            <td>${contact.nom}</td>
            <td>${contact.prenom}</td>
            <td>${contact.email}</td>
            <td>${contact.date_ajout.split("T")[0]}</td>
            <td>
                <button class="edit" onclick="editContact(${contact.id})">Edit</button>
                <button class="delete" onclick="deleteContact(${contact.id})">Delete</button>
            </td>
        `
        tableBody.appendChild(row)
    })
}


window.editContact = async function(id){
    const reponse = await fetch(`${BASE_URL}/api/contacts/${id}`, {
        headers: authHeaders()
    })
    const contact = await reponse.json()

    if(!contact || !contact.nom) return

    document.getElementById("nom").value = contact.nom
    document.getElementById("prenom").value = contact.prenom
    document.getElementById("email").value = contact.email

    editId = id
}


window.deleteContact = async function(id){
    if(!confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) return

    await fetch(`${BASE_URL}/api/contacts/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    })

    loadContact()
}