var hashTable = {};

function exists(key)
{
    return (key in hashTable);
}

function get(key)
{
    return hashTable[key];
}

function put(key, value)
{
    hashTable[key] = value;
}

function remove(key)
{
    if (exists(key))
    {
        delete hashTable[key]
    }
}

module.exports = {
    get, put, remove, exists
};
