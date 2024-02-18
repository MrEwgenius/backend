const { Brand, Basket, BasketProduct, Product } = require('../models/models')
const ApiError = require('../error/ApiError')
const jwt = require('jsonwebtoken');
class BasketController {



    async getAll(req, res, next) {
        const userId = req.user.id
        const basket = await Basket.findOne({ where: { userId } });
        if (!basket) {
            return res.json([]); // Если корзина не найдена, возвращаем пустой массив
        }
        return res.json([basket]); // Возвращаем корзину пользователя

        // try {
        //     // Получаем заголовок Authorization из запроса
        //     const authorizationHeader = req.headers['authorization'];
        //     if (!authorizationHeader) {
        //         // Если заголовок отсутствует, возвращаем ошибку
        //         throw new ApiError(401, 'Необходима авторизация');
        //     }

        //     // Разбиваем заголовок на части по пробелу
        //     const parts = authorizationHeader.split(' ');
        //     if (parts.length !== 2 || parts[0] !== 'Bearer') {
        //         // Если заголовок неверного формата, возвращаем ошибку
        //         throw new ApiError(401, 'Неверный формат токена');
        //     }

        //     const token = parts[1]; // Получаем сам токен из частей заголовка
        //     const decodedToken = jwt.verify(token, process.env.SECRET_KEY); // Декодируем токен

        //     // Извлекаем id пользователя из декодированного токена
        //     const userId = decodedToken.id;

        //     // Теперь вы можете использовать userId для поиска корзины пользователя и возврата ее в ответе

        //     const basket = await Basket.findOne({ where: { userId } });
        //     if (!basket) {
        //         return res.json([]); // Если корзина не найдена, возвращаем пустой массив
        //     }
        //     return res.json([basket]); // Возвращаем корзину пользователя
        // } catch (err) {
        //     next(err);
        // }
    }

    async basketProduct(req, res, next) {
        try {
            let { productId } = req.body; // Получите идентификатор товара и количество из тела запроса
            // const { id } = req.params;
            let userId = req.user.id; // Получите идентификатор пользователя из аутентификационного токена

            // Проверьте, существует ли корзина для данного пользователя
            let basket = await Basket.findOne({ where: { userId } });
            if (!basket) {
                // Если корзина не существует, создайте новую
                basket = await Basket.create({ userId });
            }

            // Добавьте товар в корзину пользователя
            let basketProduct = await BasketProduct.create({ basketId: basket.id, productId });

            const basketItems = await BasketProduct.findAll({ where: { basketId: basket.id } });
            // Создаем массив идентификаторов продуктов из корзины
            const productIds = basketItems.map(item => item.productId);

            // Находим все товары с помощью идентификаторов
            const products = await Product.findAll({
                where: { id: productIds }
                // include: [{ model: ProductInfo, as: 'info' }]
            });

            res.status(201).json(
                products
            );
        } catch (error) {
            next(error);
        }
    }


    async getBasketItems(req, res, next) {
        try {
            const userId = req.user.id; // Идентификатор пользователя из аутентификационного токена

            // Находим корзину пользователя
            const basket = await Basket.findOne({ where: { userId } });
            if (!basket) {
                return res.status(404).json({ message: 'Корзина не найдена' });
            }

            // Находим все товары в корзине пользователя
            const basketItems = await BasketProduct.findAll({ where: { basketId: basket.id } });
            // Создаем массив идентификаторов продуктов из корзины
            const productIds = basketItems.map(item => item.productId);

            // Находим все товары с помощью идентификаторов
            const products = await Product.findAll({
                where: { id: productIds }
                // include: [{ model: ProductInfo, as: 'info' }]
            });
            res.status(200).json(products);

            // Возвращаем список товаров в ответе
        } catch (error) {
            next(error);
        }
    }
    async removeBasketItems(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id; // Идентификатор пользователя из аутентификационного токена
            // Находим корзину пользователя
            const basket = await Basket.findOne({ where: { userId } });
            if (!basket) {
                return res.status(404).json({ message: 'Корзина не найдена' });
            }
            // // Находим корзину пользователя
            const basketItem = await BasketProduct.findOne({ where: { productId: id } });
            if (!basketItem) {
                return res.status(404).json({ message: 'Элемент корзины не найден' });
            }

            await basketItem.destroy();

            // Возвращаем список товаров в ответе
            res.status(200).json({ message: 'Элемент корзины успешно удален' });
        } catch (error) {
            next(error);
        }   
    }

}

module.exports = new BasketController()