// Clear localStorage data for testing
if (typeof window !== "undefined") {
  localStorage.removeItem("currentUser")
  localStorage.removeItem("user")
  localStorage.removeItem("hearts")
  localStorage.removeItem("cards")
  console.log("User data cleared successfully")
} else {
  console.log("This script should be run in the browser console")
}
