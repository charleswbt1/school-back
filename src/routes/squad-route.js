const express = require('express');
const router = express.Router();

router.get('/:id', (req, res) => {
    res.status(200).json({
        id: 'HIG_2605',
        name: 'Francisco Villa oficial 0576',
        description: 'Secundaria',
        logo: 'https://scontent-qro1-1.xx.fbcdn.net/v/t39.30808-6/301382105_444741201008491_6966893948921689017_n.png?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=kiEe5Dh8XRAQ7kNvwHBxmY4&_nc_oc=Adq0AjT9511hVAoKl5uUrmsp-kHzsXw05m3v24l2HY2OyBJpSC0Xy2y3pL1uIJXK91seu31-cdaS62fJbtCQl-s2&_nc_zt=23&_nc_ht=scontent-qro1-1.xx&_nc_gid=XuQJDwMNesGGG5-BrvifUA&_nc_ss=7b289&oh=00_Af5a4sCahEiUVxhXdpEifIjdAkCsTJgHcobzuHGjTlpjCw&oe=6A1913E4'
    });
});

module.exports = router;
