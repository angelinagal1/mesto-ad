/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { 
  getUserInfo, 
  getCardList, 
  setUserInfo, 
  addNewCard, 
  deleteCardFromServer,
  changeLikeCardStatus,
  updateAvatar 
} from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// Настройки валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings); 

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

// DOM для попапа удаления
const deleteConfirmModalWindow = document.querySelector(".popup_type_remove-card");
const deleteConfirmForm = deleteConfirmModalWindow.querySelector(".popup__form");

// DOM для попапа статистики
const logoElement = document.querySelector(".header__logo") || document.querySelector(".logo");
const usersStatsModalWindow = document.querySelector(".popup_type_info");
const popupTitle = usersStatsModalWindow.querySelector(".popup__title");
const popupInfo = usersStatsModalWindow.querySelector(".popup__info");
const popupText = usersStatsModalWindow.querySelector(".popup__text");
const popupList = usersStatsModalWindow.querySelector(".popup__list");

// Переменные для хранения данных удаляемой карточки
let cardToDeleteId = null;
let cardToDeleteElement = null;

// Функция для закрытия всех попапов
const closeAllPopups = () => {
  document.querySelectorAll('.popup').forEach(popup => {
    popup.classList.remove('popup_is-opened');
  });
};

// Обработчик открытия изображения
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// Обработчик формы профиля
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  const inputs = evt.target.querySelectorAll('input');
  
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;
  inputs.forEach(input => input.disabled = true);
  
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      inputs.forEach(input => input.disabled = false);
    });
};

// Обработчик формы аватара
const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  const inputs = evt.target.querySelectorAll('input');
  
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;
  inputs.forEach(input => input.disabled = true);
  
  updateAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => {
      console.log('Ошибка обновления аватара:', err);
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      inputs.forEach(input => input.disabled = false);
    });
};

// Обработчик формы добавления карточки
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  const inputs = evt.target.querySelectorAll('input');
  
  submitButton.textContent = "Создание...";
  submitButton.disabled = true;
  inputs.forEach(input => input.disabled = true);
  
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      const myUserId = profileTitle.dataset.userId || localStorage.getItem('userId');
      
      const cardElement = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
        },
        myUserId
      );
      
      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      inputs.forEach(input => input.disabled = false);
    });
};

// Обработчик лайка карточки
const handleLikeCard = (cardId, likeButton, likeCountElement, isLikedByMe, currentLikesCount) => {
  const isCurrentlyLiked = likeButton.classList.contains("card__like-button_is-active");
  
  likeButton.disabled = true;
  
  changeLikeCardStatus(cardId, isCurrentlyLiked)
    .then((updatedCard) => {
      if (likeCountElement) {
        likeCountElement.textContent = updatedCard.likes.length;
      }
      
      likeButton.classList.toggle("card__like-button_is-active");
    })
    .catch((err) => {
      console.log('Ошибка при изменении лайка:', err);
      const originalColor = likeButton.style.color;
      likeButton.style.color = 'red';
      
      setTimeout(() => {
        likeButton.style.color = originalColor;
      }, 1000);
    })
    .finally(() => {
      likeButton.disabled = false;
    });
};

// Функция открытия попапа подтверждения удаления
const openDeleteConfirmModal = (cardId, cardElement) => {
  cardToDeleteId = cardId;
  cardToDeleteElement = cardElement;
  openModalWindow(deleteConfirmModalWindow);
};

// Обработчик клика на кнопку удаления
const handleDeleteCard = (cardId, cardElement) => {
  openDeleteConfirmModal(cardId, cardElement);
};

// Обработчик подтверждения удаления
const handleDeleteConfirm = (evt) => {
  evt.preventDefault();
  
  if (!cardToDeleteId || !cardToDeleteElement) return;
  
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  submitButton.textContent = "Удаление...";
  submitButton.disabled = true;
  
  deleteCardFromServer(cardToDeleteId)
    .then(() => {
      cardToDeleteElement.remove();
      closeModalWindow(deleteConfirmModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка при удалении карточки:', err);
    })
    .finally(() => {
      cardToDeleteId = null;
      cardToDeleteElement = null;
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    });
};

// СТАТИСТИКА
// Функция для форматирования даты (из задания)
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (title, value) => {
  const template = document.getElementById('popup-info-definition-template');
  const element = template.content.cloneNode(true);
  const term = element.querySelector('.popup__info-term');
  const description = element.querySelector('.popup__info-description');
  
  term.textContent = title;
  description.textContent = value;
  
  return element;
};

// Обработчик клика на логотип
const handleLogoClick = () => { 
  popupTitle.textContent = "Статистика пользователей";
  popupText.textContent = "Все пользователи:";
  popupInfo.innerHTML = '';
  popupList.innerHTML = '';
  
  getCardList()
    .then((cards) => {
      if (!cards || cards.length === 0) {
        openModalWindow(usersStatsModalWindow);
        return;
      }
      
      const sortedCards = [...cards].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      const totalCards = sortedCards.length;
      
      const userStats = {};
      sortedCards.forEach(card => {
        if (!userStats[card.owner._id]) {
          userStats[card.owner._id] = { user: card.owner, count: 0 };
        }
        userStats[card.owner._id].count++;
      });
      
      let maxCardsFromOneUser = 0;
      Object.values(userStats).forEach(stat => {
        if (stat.count > maxCardsFromOneUser) {
          maxCardsFromOneUser = stat.count;
        }
      });
      
      popupInfo.append(createInfoString("Всего карточек:", totalCards.toString()));
      popupInfo.append(createInfoString("Первая создана:", formatDate(new Date(sortedCards[sortedCards.length - 1].createdAt))));
      popupInfo.append(createInfoString("Последняя создана:", formatDate(new Date(sortedCards[0].createdAt))));
      popupInfo.append(createInfoString("Всего пользователей:", Object.keys(userStats).length.toString()));
      popupInfo.append(createInfoString("Максимум карточек от одного:", maxCardsFromOneUser.toString()));
      
      // Список пользователей
      Object.values(userStats).forEach(stat => {
        popupList.append(
          createInfoString(stat.user.name, "")
        );
      });
      
      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка загрузки статистики:', err);
      openModalWindow(usersStatsModalWindow);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
deleteConfirmForm.addEventListener("submit", handleDeleteConfirm);

// Обработчик для логотипа (статистика)
if (logoElement && usersStatsModalWindow) {
  logoElement.addEventListener("click", handleLogoClick);
}

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

// Настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Закрываем все попапы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.popup').forEach(popup => {
    popup.classList.remove('popup_is-opened');
  });
});

// Загрузка данных с сервера
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
    const myUserId = userData._id;
    
    profileTitle.dataset.userId = myUserId;
    localStorage.setItem('userId', myUserId);
    
    placesWrap.innerHTML = '';
    
    cards.forEach((cardData) => {
      const cardElement = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
        },
        myUserId
      );
      placesWrap.append(cardElement);
    });
  })
  .catch((err) => {
    console.log("Ошибка загрузки:", err);
  });