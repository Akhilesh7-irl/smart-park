
const firebaseConfig = {
  apiKey: "AIzaSyD58LEPZQLvhA7ZJB_L5kTgEXWnZ3hTRW4",
  authDomain: "smart-parking-8ad9c.firebaseapp.com",
  databaseURL: "https://smart-parking-8ad9c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-parking-8ad9c",
  storageBucket: "smart-parking-8ad9c.firebasestorage.app",
  messagingSenderId: "464645794390",
  appId: "1:464645794390:web:95b0a5cd7f3d694871e9f7",
  measurementId: "G-KQ5Z8LX4Z2"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const slotsRef = database.ref("ParkingSlots");


let slots = [];

function getSlotLocation(slotId) {
  const locations = {
    "Slot1": { lat: 18.4638, lng: 73.8682 },
    "Slot2": { lat: 18.4632, lng: 73.8676 },
    "Slot3": { lat: 18.4640, lng: 73.8679 },
    "Slot4": { lat: 18.4636, lng: 73.8684 },
    "Slot5": { lat: 18.4633, lng: 73.8681 }
  };
  return locations[slotId];
}


function getStatusDetails(status) {
  if (status === "available") {
    return { cls: "status-available", text: "Available" };
  }
  return { cls: "status-occupied", text: "Occupied" };
}


function loadParkingSlots() {
  const list = document.getElementById("slotList");
  list.innerHTML = "";

  slots.forEach((slot) => {
    const info = getStatusDetails(slot.status);

    const card = document.createElement("div");
    card.className = "slot-card";

    card.innerHTML = `
      <div class="slot-info">
        <span class="slot-id">${slot.id}</span>
        <span class="slot-status ${info.cls}">${info.text}</span>
      </div>
    `;

    list.appendChild(card);
  });
}


let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 18.4635, lng: 73.8679 },
    zoom: 17
  });
}

function updateMapMarkers() {
  if (!map) return;

  markers.forEach(m => m.setMap(null));
  markers = [];

  slots.forEach(slot => {
    const icon =
      slot.status === "available"
        ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        : "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

    const marker = new google.maps.Marker({
      position: slot.location,
      map,
      label: slot.id.replace("Slot", ""),
      icon
    });

    markers.push(marker);
  });
}


function listenToSlots() {
  slotsRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    slots = Object.keys(data).map(key => ({
      id: key,
      status: data[key].status === "FREE" ? "available" : "occupied",
      location: getSlotLocation(key)
    })).filter(s => s.location);

    loadParkingSlots();
    updateMapMarkers();
  });
}


window.onload = () => {
  listenToSlots();
};
