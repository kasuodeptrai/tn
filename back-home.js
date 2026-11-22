// Nút quay về trang chủ
const homeButton = document.createElement("a");

homeButton.href = "/ten-repository/";
homeButton.innerHTML = "← Trang chủ";

homeButton.style.cssText = `
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 9999;
  padding: 12px 20px;
  background: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 30px;
  text-decoration: none;
  font-family: Arial, sans-serif;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);
  transition: 0.2s;
`;

homeButton.onmouseover = () => {
  homeButton.style.transform = "translateY(-2px)";
};

homeButton.onmouseout = () => {
  homeButton.style.transform = "translateY(0)";
};

document.body.appendChild(homeButton);
