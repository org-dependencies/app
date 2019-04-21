const React = require('react')
const PropTypes = require('prop-types')

const Logo = ({ className, href }) => {
  const classes = `${className} header-brand`

  return (
    <a className={classes} href={href}>
      <img
        className="header-brand-img"
        src="https://raw.githubusercontent.com/OrgDependencies/brand/master/logo.png"
        alt=""
      />
      Org Dependencies
    </a>
  )
}

Logo.propTypes = {
  className: PropTypes.string,
  href: PropTypes.string
}

Logo.defaultProps = {
  className: '',
  href: '/dashboard'
}

module.exports = Logo
