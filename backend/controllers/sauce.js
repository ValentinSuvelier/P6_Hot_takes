const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => { // création de sauce puis méthode POST depuis route sauce
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        userLiked: [],
        userDisliked: [],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    sauce.save()
        .then(() => {
            res.status(201).json({
                message: 'sauce créée !'
            })
        })
        .catch((err) => {
            res.status(400).json(err);
        })
}
exports.likesAndDislikes = (req, res, next) => {
    const like = parseInt(req.body.like);
    console.log(req.body)
    switch (like) {
        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    // si l'userID à déjà like ce produit, on soustrait 1 like si il re-click sur le même bouton
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        sauce.usersLiked.splice(req.body.userId, 1)
                        sauce.likes--;
                        Sauce.updateOne({ _id: req.params.id }, { likes: sauce.likes, usersLiked: sauce.usersLiked })
                            .then(() => {
                                res.status(201).json({ message: 'Like removed' })
                            })
                            .catch((err) => {
                                res.status(400).json({ err })
                            })
                    }
                    // si l'userID à déjà dislike ce produit, on soustrait 1 dislike si il re-click sur le même bouton
                    else if (sauce.usersDisliked.includes(req.body.userId)) {
                        sauce.usersDisliked.splice(req.body.userId, 1)
                        sauce.dislikes--;
                        Sauce.updateOne({ _id: req.params.id }, { dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked })
                            .then(() => {
                                res.status(201).json({ message: 'Dislike removed' })
                            })
                            .catch((err) => {
                                res.status(400).json({ err })
                            })
                    }
                })
                .catch((err) => res.status(500).json({ err }))
            break;
        case 1:
            // envoi de l'userID dans le tableau usersLiked lors d'un like
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    sauce.likes++;
                    sauce.usersLiked.push(req.body.userId)
                    Sauce.updateOne({ _id: req.params.id }, { likes: sauce.likes, usersLiked: sauce.usersLiked })
                        .then(() => {
                            res.status(201).json({ message: 'Liked' })
                        })
                        .catch((err) => {
                            res.status(400).json({ err })
                        })
                })
                .catch((err) => res.status(500).json({ err }))
            break;
        case -1:
            // envoi de l'userID dans le tableau usersDisliked lors d'un dislike
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    sauce.dislikes++;
                    sauce.usersDisliked.push(req.body.userId)
                    Sauce.updateOne({ _id: req.params.id }, { dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked })
                        .then(() => {
                            res.status(201).json({ message: 'Disliked' })
                        })
                        .catch((err) => {
                            res.status(400).json({ err })
                        })
                })
                .catch((err) => res.status(500).json({ err }))
            break;
        default:
            console.log("La variable est supérieur ou inférieur au controller");
    }
}

exports.updateSauce = (req, res, next) => { //MODIFY
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    // on prend comme prmier argument l'objet que l'on modifie, et le deuxième sera le nouvel objet avec le bon _id des paramètres
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => { //DELETE
    Sauce.findOne({ _id: req.params.id })
    // on supprime l'image du dossier images avec unlink ainsi que l'id des paramètres de route
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
  };

exports.getAllSauces = (req, res, next) => { //GET (all sauces)
    Sauce.find()
        .then((sauces) => {
            res.status(200).json(sauces);
        })
        .catch(err => res.status(400).json(err))
}

exports.getOneSauce = (req, res, next) => { //GET (one sauce)
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            res.status(200).json(sauce)
        })
        .catch(err => res.status(400).json(err))
}