// Room data
const rooms = [
  { name: "Standard", price: 2500, guests: 2, total: 10, facilities: "AC, TV, Wi-Fi",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500" },
  { name: "Deluxe", price: 4000, guests: 3, total: 6, facilities: "AC, TV, Wi-Fi, Mini fridge",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500" },
  { name: "Suite", price: 6500, guests: 4, total: 3, facilities: "AC, TV, Wi-Fi, Lounge area",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500" }
];

// Date helper
function dayFromToday(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// Bookings
const bookings = [
  { roomType: "Standard", rooms: 4, checkIn: dayFromToday(0), checkOut: dayFromToday(3) },
  { roomType: "Deluxe",   rooms: 2, checkIn: dayFromToday(1), checkOut: dayFromToday(4) },
  { roomType: "Suite",    rooms: 1, checkIn: dayFromToday(2), checkOut: dayFromToday(5) }
];

// Room cards
for (let i = 0; i < rooms.length; i++) {
  document.getElementById("roomList").innerHTML += `
    <div class="card">
      <img src="${rooms[i].image}" alt="${rooms[i].name}">
      <h3>${rooms[i].name}</h3>
      <p class="price">₹${rooms[i].price}/night</p>
      <p>${rooms[i].guests} guests</p>
      <small>${rooms[i].facilities}</small>
    </div>`;
  document.getElementById("roomType").innerHTML += `<option value="${i}">${rooms[i].name}</option>`;
}

const checkInBox = document.getElementById("checkIn");
const checkOutBox = document.getElementById("checkOut");
checkInBox.min = dayFromToday(0);

// Nights
function getNights(checkIn, checkOut) {
  return (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
}

// Occupied rooms
function occupiedRooms(roomName, checkIn, checkOut) {
  let count = 0;
  for (let i = 0; i < bookings.length; i++) {
    const b = bookings[i];
    if (b.roomType === roomName && b.checkIn < checkOut && b.checkOut > checkIn) {
      count += b.rooms;
    }
  }
  return count;
}

// Availability
function showAvailability() {
  const checkIn = checkInBox.value;
  const checkOut = checkOutBox.value;
  const nights = getNights(checkIn, checkOut);
  const box = document.getElementById("availability");

  if (!checkIn || !checkOut || nights <= 0) {
    document.getElementById("nights").innerHTML = "";
    box.innerHTML = "<p class='hint'>Select check-in and check-out dates (check-out after check-in) to see availability.</p>";
    return;
  }

  document.getElementById("nights").innerHTML = `<span class="pill">${nights} Night(s)</span>`;

  let html = "";
  for (let i = 0; i < rooms.length; i++) {
    const booked = occupiedRooms(rooms[i].name, checkIn, checkOut);
    const available = rooms[i].total - booked;
    const percent = booked / rooms[i].total * 100;
    const status = available > 0 ? "Rooms available" : "Fully booked";
    html += `
      <div class="card center">
        <h3>${rooms[i].name}</h3>
        <p class="big ${available == 0 ? "full" : ""}">${available} available</p>
        <p>${booked} booked out of ${rooms[i].total} rooms</p>
        <div class="bar"><div style="width:${percent}%"></div></div>
        <small>${status} for ${nights} night(s)</small>
      </div>`;
  }
  box.innerHTML = html;
}

// Events
checkInBox.addEventListener("change", function () {
  checkOutBox.min = checkInBox.value;
  showAvailability();
});
checkOutBox.addEventListener("change", showAvailability);

// Mobile digits
document.getElementById("mobile").addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "");
});

// Form submit
document.getElementById("bookingForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const checkIn = checkInBox.value;
  const checkOut = checkOutBox.value;
  const nights = getNights(checkIn, checkOut);
  const room = rooms[document.getElementById("roomType").value];
  const count = Number(document.getElementById("roomCount").value);
  const message = document.getElementById("message");

  if (nights <= 0) {
    message.innerHTML = "<p class='note'>Check-out must be after check-in.</p>";
    return;
  }

  const available = room.total - occupiedRooms(room.name, checkIn, checkOut);
  if (count > available) {
    message.innerHTML = `<p class='note'>Only ${available} ${room.name} room(s) available for these dates.</p>`;
    return;
  }

  const total = room.price * nights * count;
  bookings.push({ roomType: room.name, rooms: count, checkIn: checkIn, checkOut: checkOut });

  message.innerHTML = `<p class='note'>Guest details submitted successfully.<br>
    ${nights} Night(s): ₹${room.price} × ${nights} × ${count} = <b>₹${total.toLocaleString("en-IN")}</b></p>`;

  this.reset();
  checkInBox.value = checkIn;
  checkOutBox.value = checkOut;
  showAvailability();
});

showAvailability();
