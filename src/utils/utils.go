package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/bhav-07/haven/models"
	"github.com/dgrijalva/jwt-go"
	"gorm.io/gorm"
)

func GetUserfromID(userId uint, db *gorm.DB) (models.User, error) {
	var user models.User
	result := db.Where("id = ?", userId).First(&user)
	if result.Error == gorm.ErrRecordNotFound {
		return user, result.Error
	}

	return user, nil
}

func GetUserInfo(accessToken string) (*models.User, error) {
	userInfoEndpoint := "https://www.googleapis.com/oauth2/v2/userinfo"
	resp, err := http.Get(fmt.Sprintf("%s?access_token=%s", userInfoEndpoint, accessToken))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	type GoogleUserInfo struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	var googleUser GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		return nil, err
	}

	user := &models.User{
		Email: googleUser.Email,
		Name:  googleUser.Name,
	}

	return user, nil
}

func SignJWT(userInfo *models.User) (string, error) {
	claims := jwt.MapClaims{
		"id":       userInfo.ID,
		"name":     userInfo.Name,
		"email":    userInfo.Email,
		"nickname": userInfo.Nickname,
		"iss":      "oauth-app-golang",
		"exp":      time.Now().Add(time.Hour * 24 * 30).Unix(), // 30 days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte("your-secret-key"))
	if err != nil {
		return "", err
	}

	return signedToken, nil
}

func VerifyJWT(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte("your-secret-key"), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token claims")
}
