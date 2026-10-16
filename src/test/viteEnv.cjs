module.exports = ({
  types: t
}) => ({
  visitor: {
    MetaProperty(path) {
      if (path.node.meta.name === 'import' && path.node.property.name === 'meta') path.replaceWith(t.valueToNode({
        env: {
          DEV: true,
          VITE_ROUTER_MODE: ''
        }
      }));
    }
  }
});
