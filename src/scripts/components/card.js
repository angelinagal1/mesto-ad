export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  const template = document.getElementById("card-template");
  if (!template) return null;
  return template.content.querySelector(".card").cloneNode(true);
};

// Создание карточки
export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  userId
) => {
  const cardElement = getTemplate();
  if (!cardElement) return document.createElement('div');
  
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  
  if (cardImage) {
    cardImage.src = data.link || "";
    cardImage.alt = data.name || "";
  }
  
  if (cardTitle) {
    cardTitle.textContent = data.name || "";
  }
  
  if (likeCountElement) {
    likeCountElement.textContent = data.likes ? data.likes.length : 0;
  }
  
  // Проверяем, лайкнул ли пользователь эту карточку
  const isLikedByMe = data.likes && data.likes.some(like => like._id === userId);
  const currentLikesCount = data.likes ? data.likes.length : 0;
  
  if (isLikedByMe && likeButton) {
    likeButton.classList.add("card__like-button_is-active");
  }
  
  if (data.owner && data.owner._id !== userId && deleteButton) {
    deleteButton.style.display = "none";
  }
  
 // Навешиваем обработчики событий
  if (onLikeIcon && likeButton) {
    likeButton.addEventListener("click", () => {
      onLikeIcon(data._id, likeButton, likeCountElement, isLikedByMe, currentLikesCount);
    });
  }
  
  if (onDeleteCard && deleteButton) {
    deleteButton.addEventListener("click", () => onDeleteCard(data._id, cardElement));
  }
  
  if (onPreviewPicture && cardImage) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }
  
  return cardElement;
};