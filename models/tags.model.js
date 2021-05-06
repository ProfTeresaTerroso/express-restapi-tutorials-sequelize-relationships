module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define("tag", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Name tag can not be empty!" } } 
        }
    }, {
        timestamps: false
    });
    return Tag;
};